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

resource "aws_iam_role" "manga_bot_lamba_role" {
  name = "manga_bot_lamba_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

data "archive_file" "lambda_source" {
  type        = "zip"
  source_file = "../dist/index.js"
  output_path = "../dist/index.js.zip"
}

resource "aws_lambda_function" "manga_bot_lamba" {
  filename      = data.archive_file.lambda_source.output_path
  function_name = "manga_bot"
  role          = aws_iam_role.manga_bot_lamba_role.arn
  handler       = "exports.handler"

  source_code_hash = data.archive_file.lambda_source.output_base64sha256

  runtime = "nodejs14.x"

  # environment {
  #   variables = {
  #     foo = "bar"
  #   }
  # }
}
