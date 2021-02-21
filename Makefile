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
	tsc

#test.lint: @ Lint the project
.PHONY: test.lint
test.lint: deps.install
	./node_modules/.bin/tslint -c tslint.json 'src/**/*.ts'

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
	cd infra; terraform apply
