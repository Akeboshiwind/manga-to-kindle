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



# >> Locals

locals {
  function_name = "manga_to_kindle"
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

data "aws_iam_policy" "basic_lambda_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy_attachment" "lambda_role_attachment" {
  name       = "${local.function_name}_lambda_role_attachment"
  roles      = [aws_iam_role.lambda_role.name]
  policy_arn = data.aws_iam_policy.basic_lambda_policy.arn
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

  source_code_hash = data.archive_file.lambda_source.output_base64sha256

  runtime = "nodejs14.x"

  environment {
    variables = {
      BOT_TOKEN = var.bot_token
      # TODO: Add secret
      # BOT_HOOK_PATH = "${var.bot_secret}/"
    }
  }
}
