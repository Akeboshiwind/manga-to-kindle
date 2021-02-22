.DEFAULT_GOAL := help

#help:	@ List available tasks on this project
.PHONY: help
help:
	@grep -E '[a-zA-Z\.\-]+:.*?@ .*$$' $(MAKEFILE_LIST) | tr -d '#' | awk 'BEGIN {FS = ":.*?@ "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

#run: @ Run the app locally
.PHONY: run
run: deps.install test.lint
	ts-node src/index.ts

#deps.install: @ Install dependencies
.PHONY: deps.install
deps.install:
	npm install

#build: @ Build the project
.PHONY: build
build: deps.install
	npx webpack

#test.lint: @ Lint the project
.PHONY: test.lint
test.lint: deps.install
	npx tslint -c tslint.json 'src/**/*.ts'

#deploy: @ Deploy the bot to AWS Lambda
.PHONY: deploy
deploy: build test.lint deploy.init deploy.apply

#deploy.init: @ Initialize terraform
.PHONY: deploy.init
deploy.init:
	cd infra; terraform init

#deploy.apply: @ Apply the terraform
.PHONY: deploy.apply
deploy.apply:
	$(eval BOT_TOKEN=$(shell gopass show personal/bots/manga-to-kindle token))
	$(eval ACCOUNT_ID=$(shell gopass show personal/aws/Administrator/amazon.com 'Account ID'))
	cd infra; terraform apply -var "bot_token=$(BOT_TOKEN)" -var "account_id=$(ACCOUNT_ID)"
	curl "https://api.telegram.org/bot$(BOT_TOKEN)/setWebHook?url=$$(cd infra; terraform output webhook_url)"
