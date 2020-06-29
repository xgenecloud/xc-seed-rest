[![Build Status](https://travis-ci.org/dwyl/esta.svg?branch=master)](https://travis-ci.com/github/xgenecloud/xc-seed-rest) 



knexMigrator
xc-data-mapper
chart

swagger spec


# Deploy to GCP Cloud Run 

```
# Add sql connection parameters for production environment

./xc.config.json
```

```
 "envs": {
    "production": {
      "db": [
        {
          "client": "mysql",
          "connection": {
            "host": "localhost",
            "port": "3306",
            "user": "root",
            "password": "password",
            "database": "sakila"
          },
          "meta": {
            "tableName": "_evolutions",
            "dbAlias": "primary"
          }
        }
      ],
      "api" : {}
    }
  },
```


[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)


# AWS Lambda Deployment

- Open `server/config/default.config.js` and set `aws.lambda` to true and change other cloud serverless platform values as `false`.
- Install AWS cli & authenticate

    Refer : https://docs.aws.amazon.com/cli/index.html
    
- Open `serverless.yml` file and do  the  necessary changes.
- `npm run aws:lambda`

# Azure Function App

- Install Azure cli and login.
- `npm install -g azure-functions-core-tools`
- `npm run azure:deploy`

# GCP Cloud Function


- Install Google Cloud cli and authenticate.
- `npm run gcp:fn`


# Zeit Now


- Install Zeit now library and authenticate using email.
- Add `production` environment in `config.xc.json`
 
    ```
    "envs": {
        "production": {
          "db": [
            {
              "client": "mysql",
              "connection": {
                "host": "localhost",
                "port": "3306",
                "user": "root",
                "password": "password",
                "database": "sakila"
              },
              "meta": {
                "tableName": "_evolutions",
                "dbAlias": "primary"
              }
            }
          ],
          "api" : {}
        }
      },
    ```
- `npm run zeit:now`


# IBM function

- Install CLI 
  Refer https://cloud.ibm.com/functions/learn/cli



# Performance

- Install `autocannon`

    `npm i autocannon -g`
- test
    
    ```
    xc-examples-$autocannon -p 20 -c 50 -d 10 http://localhost:8080/api/v1/country
    Running 10s test @ http://localhost:8080/api/v1/country
    50 connections with 20 pipelining factor
    
    ┌─────────┬──────┬──────┬────────┬────────┬──────────┬───────────┬────────────┐
    │ Stat    │ 2.5% │ 50%  │ 97.5%  │ 99%    │ Avg      │ Stdev     │ Max        │
    ├─────────┼──────┼──────┼────────┼────────┼──────────┼───────────┼────────────┤
    │ Latency │ 0 ms │ 0 ms │ 605 ms │ 679 ms │ 32.98 ms │ 146.71 ms │ 1386.18 ms │
    └─────────┴──────┴──────┴────────┴────────┴──────────┴───────────┴────────────┘
    ┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬────────┬────────┐
    │ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min    │
    ├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
    │ Req/Sec   │ 271    │ 271    │ 1461    │ 1956    │ 1487.1  │ 462.75 │ 271    │
    ├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
    │ Bytes/Sec │ 387 kB │ 387 kB │ 2.08 MB │ 2.79 MB │ 2.12 MB │ 660 kB │ 387 kB │
    └───────────┴────────┴────────┴─────────┴─────────┴─────────┴────────┴────────┘
    
    Req/Bytes counts sampled once per second.
    
    15k requests in 10.07s, 21.2 MB read
  
    xc-examples-$autocannon -p 20 -c 50 -d 10 http://localhost:8080/api/v1/country/has/city  
    Running 10s test @ http://localhost:8080/api/v1/country/has/city
    50 connections with 20 pipelining factor
    
    ┌─────────┬──────┬──────┬─────────┬─────────┬──────────┬──────────┬────────────┐
    │ Stat    │ 2.5% │ 50%  │ 97.5%   │ 99%     │ Avg      │ Stdev    │ Max        │
    ├─────────┼──────┼──────┼─────────┼─────────┼──────────┼──────────┼────────────┤
    │ Latency │ 0 ms │ 0 ms │ 1118 ms │ 1706 ms │ 65.54 ms │ 289.6 ms │ 2076.43 ms │
    └─────────┴──────┴──────┴─────────┴─────────┴──────────┴──────────┴────────────┘
    ┌───────────┬─────┬──────┬─────────┬─────────┬─────────┬─────────┬────────┐
    │ Stat      │ 1%  │ 2.5% │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min    │
    ├───────────┼─────┼──────┼─────────┼─────────┼─────────┼─────────┼────────┤
    │ Req/Sec   │ 0   │ 0    │ 759     │ 1000    │ 700.1   │ 343.14  │ 101    │
    ├───────────┼─────┼──────┼─────────┼─────────┼─────────┼─────────┼────────┤
    │ Bytes/Sec │ 0 B │ 0 B  │ 3.63 MB │ 4.78 MB │ 3.35 MB │ 1.64 MB │ 483 kB │
    └───────────┴─────┴──────┴─────────┴─────────┴─────────┴─────────┴────────┘
    
    Req/Bytes counts sampled once per second.
    
    7k requests in 10.07s, 33.5 MB read
    
      
      
    xc-examples-$autocannon -p 20 -c 50 -d 10 http://localhost:8080/country/1/city
    Running 10s test @ http://localhost:8080/country/1/city
    50 connections with 20 pipelining factor
    
    ┌─────────┬──────┬──────┬────────┬────────┬──────────┬──────────┬────────────┐
    │ Stat    │ 2.5% │ 50%  │ 97.5%  │ 99%    │ Avg      │ Stdev    │ Max        │
    ├─────────┼──────┼──────┼────────┼────────┼──────────┼──────────┼────────────┤
    │ Latency │ 0 ms │ 0 ms │ 411 ms │ 439 ms │ 22.41 ms │ 98.39 ms │ 1026.93 ms │
    └─────────┴──────┴──────┴────────┴────────┴──────────┴──────────┴────────────┘
    ┌───────────┬────────┬────────┬─────────┬─────────┬────────┬────────┬────────┐
    │ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg    │ Stdev  │ Min    │
    ├───────────┼────────┼────────┼─────────┼─────────┼────────┼────────┼────────┤
    │ Req/Sec   │ 926    │ 926    │ 2385    │ 2509    │ 2179.2 │ 476.29 │ 926    │
    ├───────────┼────────┼────────┼─────────┼─────────┼────────┼────────┼────────┤
    │ Bytes/Sec │ 751 kB │ 751 kB │ 1.86 MB │ 1.98 MB │ 1.7 MB │ 368 kB │ 750 kB │
    └───────────┴────────┴────────┴─────────┴─────────┴────────┴────────┴────────┘
    
    Req/Bytes counts sampled once per second.
    
    0 2xx responses, 21788 non 2xx responses
    22k requests in 10.07s, 17 MB read
  
    
    ```


#Folder Structure Explained

[Click Here](https://xgenecloud.com/project-structure-rest)





# AWS Lambda CLI deployment


- CLI Setup
    - https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html
    - `$ aws iam create-role --role-name xc-rest-lambda --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'`
    - Add default policies `aws iam attach-role-policy --role-name xc-rest-lambda --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`
- CLI Deploy
    - Zip the project 
        - In unix system use  `npm run lambda:zip`
        - For windows `npm run lambda:zip:win`
    - Deploy to AWS Lambda using following command
        https://docs.aws.amazon.com/cli/latest/reference/lambda/create-function.html#examples
        ```
        aws lambda create-function --function-name xc-rest-serverless-app --zip-file fileb://lambda.zip --handler server/app.lambda --runtime nodejs12.x --role arn:aws:iam::249717198246:role/xc-rest-lambda --publish --timeout 180
        ```
    - Invoke the function using 
        ```
        aws lambda invoke --function-name xc-rest-serverless-app  out --log-type Tail --query 'LogResult' --output text |  base64 -D
        ```
- AWS API Gateway Setup
    - Add a trigger `API Gateway` to the `xc-rest-serverless-app` using AWS web console.
        - Open API Gateway page in aws console
        - Create `rest api` gateway
        - In resources add `ANY` as method to accept all the HTTP method
        - Add `/{proxy+}` as resource to match all the sub-paths
        - Under `/{proxy+}` add `ANY` as method to accept all the HTTP method
        - Now map the method to lambda function by clicking on `ANY`. On the right side within `Lambda Function` text field enter the lambda function name and save.
        - Now deploy the api gateway by clicking deploy option from the action dropdown
        - For detailed [documentation visit here](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-getting-started-with-rest-apis.html)
  
# #Alibaba Function Compute 

- Install `fun` cli tool `npm install @alicloud/fun -g`
- Setup alibaba account configuration in cli using `fun config` ( https://www.alibabacloud.com/help/doc-detail/64204.htm )
- Run 
    - `npm run ali:fn:compute`
    - or `fun deploy`
    
    
# Serverless

- Configuring serverless and aws-cli : https://www.serverless.com/framework/docs/providers/aws/guide/credentials/
