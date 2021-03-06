terraform {
  backend "s3" {
    bucket = "ake-terraform-state"
    region = "eu-west-3"
    key    = "prog/prog/node/manga-to-kindle/terraform.tfstate"
  }
}

provider "aws" {
  profile = "default"
  region  = "eu-west-3"
}

provider "archive" {}



# >> Variables

variable "bot_token" {
  type = string
}

variable "account_id" {
  type = string
}

variable "mangadex_username" {
  type = string
}

variable "mangadex_password" {
  type = string
}

variable "from_email" {
  type = string
}

variable "to_email" {
  type = string
}



# >> Locals

locals {
  # Needed for lambda permission
  region        = "eu-west-3"

  function_name = "manga_to_kindle"

  # API Gateway setup
  stage_name = "v1"
}



# >> API Gateway

resource "aws_api_gateway_rest_api" "rest_api" {
  name = local.function_name
}

resource "aws_api_gateway_resource" "resource" {
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = local.function_name
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

resource "aws_api_gateway_method" "method" {
  authorization = "NONE"
  http_method   = "POST"
  resource_id   = aws_api_gateway_resource.resource.id
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
}

resource "aws_api_gateway_integration" "integration" {
  http_method             = aws_api_gateway_method.method.http_method
  resource_id             = aws_api_gateway_resource.resource.id
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id

  triggers = {
    # NOTE: The configuration below will satisfy ordering considerations,
    #       but not pick up all future REST API changes. More advanced patterns
    #       are possible, such as using the filesha1() function against the
    #       Terraform configuration file(s) or removing the .id references to
    #       calculate a hash against whole resources. Be aware that using whole
    #       resources will show a difference after the initial implementation.
    #       It will stabilize to only change when resources change afterwards.
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.resource.id,
      aws_api_gateway_method.method.id,
      aws_api_gateway_integration.integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  stage_name    = local.stage_name
}



# >> Setup Lambda policy

data "aws_iam_policy_document" "lambda_trust_policy" {
  statement {
    actions    = ["sts:AssumeRole"]
    effect     = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "${local.function_name}_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust_policy.json
}

data "aws_iam_policy_document" "lambda_execution_policy_doc" {
  # Can write logs
  statement {
    actions = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
    ]
    effect = "Allow"
    resources = ["*"]
  }

  # Can send email
  statement {
    actions = ["ses:SendRawEmail"]
    effect  = "Allow"
    resources = [
      "arn:aws:ses:eu-west-3:${var.account_id}:identity/${split("@", var.from_email)[1]}",
    ]
    condition {
      test = "StringLike"
      variable = "ses:FromAddress"
      values = [
        var.from_email
      ]
    }
  }
}

resource "aws_iam_policy" "basic_lambda_policy" {
  name = "${local.function_name}_lambda_execution_policy"
  policy = data.aws_iam_policy_document.lambda_execution_policy_doc.json
}

resource "aws_iam_policy_attachment" "lambda_role_attachment" {
  name       = "${local.function_name}_lambda_role_attachment"
  roles      = [aws_iam_role.lambda_role.name]
  policy_arn = aws_iam_policy.basic_lambda_policy.arn
}



# >> Setup lambda

data "archive_file" "lambda_source" {
  type        = "zip"
  source_file = "../dist/bundle.js"
  output_path = "../dist/bundle.js.zip"
}

resource "aws_lambda_function" "lambda" {
  filename      = data.archive_file.lambda_source.output_path
  function_name = local.function_name
  role          = aws_iam_role.lambda_role.arn
  handler       = "bundle.index.handler"
  timeout       = 300
  memory_size   = 1024

  source_code_hash = data.archive_file.lambda_source.output_base64sha256

  runtime = "nodejs14.x"

  environment {
    variables = {
      BOT_TOKEN = var.bot_token
      # TODO: Add secret
      BOT_HOOK_PATH = "/${aws_api_gateway_resource.resource.path_part}/"
      MANGADEX_USERNAME = var.mangadex_username
      MANGADEX_PASSWORD = var.mangadex_password
      FROM_EMAIL = var.from_email
      TO_EMAIL = var.to_email
      DEBUG = "*"
    }
  }
}

resource "aws_lambda_permission" "allow_lambda_api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${local.region}:${var.account_id}:${aws_api_gateway_rest_api.rest_api.id}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.resource.path}"
}


# >> Output

output "webhook_url" {
  value = "${aws_api_gateway_deployment.deployment.invoke_url}${aws_api_gateway_stage.stage.stage_name}/${aws_api_gateway_resource.resource.path_part}/"
}
