# OSU Sustainability Office
![](https://github.com/OSU-Sustainability-Office/lambda-common-layer/actions/workflows/LCL-deploy.yml/badge.svg)

This package is used as a Lambda Layer to simplify accessing databases and user authentication between different lambda functions.

### Testing Locally

* Have Docker running
* Have AWS CLI installed to the latest version
* Install dependencies in root and in `depencencies\nodejs`
* Either decrypt the `.env.enc` or add the `.env` file in `dependencies\nodejs` (You need to be a paid OSU SO employee to view the credentials for this step)
* In root folder:
  * `sam build`
  * `sam local start-lambda`
* In a new terminal, still in root, you can now invoke the various lambda functions. [See the AWS docs here for more in depth info](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-start-lambda.html). 
* Example:
  * `aws lambda invoke --function-name AuthLogin --endpoint-url 'http://127.0.0.1:3001' --no-verify-ssl out.txt`
  * If successful, you will get a `"StatusCode": 200` output.
