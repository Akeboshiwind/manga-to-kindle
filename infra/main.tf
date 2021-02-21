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

# >> Setup policy

data "aws_iam_policy_document" "manga_bot_lambda_trust_policy" {
  statement {
    actions    = ["sts:AssumeRole"]
    effect     = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "manga_bot_lambda_role" {
  name = "manga_bot_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.manga_bot_lambda_trust_policy.json
}

data "aws_iam_policy" "basic_lambda_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy_attachment" "manga_bot_lambda_role_attachment" {
  name       = "tmanga_bot_lambda_role_attachmen"
  roles      = [aws_iam_role.manga_bot_lambda_role.name]
  policy_arn = data.aws_iam_policy.basic_lambda_policy.arn
}

# >> Setup lambda

data "archive_file" "lambda_source" {
  type        = "zip"
  source_file = "../dist/index.js"
  output_path = "../dist/index.js.zip"
}

resource "aws_lambda_function" "manga_bot_lambda" {
  filename      = data.archive_file.lambda_source.output_path
  function_name = "manga_bot"
  role          = aws_iam_role.manga_bot_lambda_role.arn
  handler       = "index.handler"

  source_code_hash = data.archive_file.lambda_source.output_base64sha256

  runtime = "nodejs14.x"

  # environment {
  #   variables = {
  #     foo = "bar"
  #   }
  # }
}
