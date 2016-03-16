#AWS Latency Check

This module will take an object of AWS endpoints and run a check against each to find the closest one.  

## Valid Services Endpoints

This check will run against the ```/ping``` endpoint for the AWS service endpoints provided.  For this reason not all AWS services are valid.  Valid services include:

* EC2
* SNS
* SQS
* SimpleDB

## Methods

### constructor(regions [, options])

Used to create an instance of the object.  

#### Arguments

* ```regions```: This whould be an object of each region to check.  Key should be the region_id and the value should be the hostname of the region to check.  Each region must have a reachable endpoint of ```http://[hostname]/ping```.
* ```options```: Various options for the test.
	* ```timeout```: The max amount of time that can be passed when checking any one region. This defaults to 4000.



### begin()

Called to actually begin the process.  After a check has been completed if you wish to re-check you can call this method again.



## Emitted Events

### check_complete
Fired after the entire check is completed.

#### Sample Usage

``` javascript
checker.on('complete', function (results) {
    console.log(results);
});
```

#### Arguments

* ```results```: An array of each region results (ordered by lowest latency).  

#### Example
``` javascript
[ 
	{ region: 'us-east-1', latency: 123 },
  	{ region: 'us-west-1', latency: 187 },
  	{ region: 'us-west-2', latency: 198 },
  	{ region: 'eu-central-1', latency: 293 },
  	{ region: 'ap-northeast-1', latency: 385 },
  	{ region: 'sa-east-1', latency: 406 },
  	{ region: 'ap-southeast-1', latency: 515 },
  	{ region: 'ap-southeast-2', latency: 754 },
  	{ region: 'eu-west-1', latency: null } 
]
```

### region_complete
After a region is complete.  

#### Sample Usage

``` javascript
checker.on('region_results', function (progress, results) {
    console.log(results);
});
```

#### Arguments

* ```progress```: The total percentage completed for the test.  This can be used to update a progress bar etc.
* ```results```: Object of the region results.

#### Example

```javascript
{ region: 'us-west-1', latency: 162 },
```

### error
If an error was thrown and the test is stopped.

#### Sample Usage

``` javascript
checker.on('error', function (err) {
    console.log(err);
});
```

#### Arguments

* ```err```: The actual error message.



## Data Model

### Region Results

* ```region```: The region that was tested.
* ```latency```: The calculated latency.  If there was an error this will be ```null```.

#### Example

``` javascript
{ region: 'us-west-1', latency: 162, status_code: 200 }
```

## Example Usage
``` javascript
// Require the library
var LatencyCheck = require('LatencyCheck');

// Define the regions to check.
var regions = {
	"us-east-1": "ec2.us-east-1.amazonaws.com",
	"us-west-1": "ec2.us-west-1.amazonaws.com",
	"ap-southeast-1": "ec2.ap-southeast-1.amazonaws.com",
	"us-west-2": "ec2.us-west-2.amazonaws.com",
	"sa-east-1": "ec2.sa-east-1.amazonaws.com",
	"eu-central-1": "ec2.eu-central-1.amazonaws.com",
	"eu-west-1": "ec2.eu-west-1.amazonaws.com",
	"ap-northeast-1": "ec2.ap-northeast-1.amazonaws.com",
	"ap-southeast-2": "ec2.ap-southeast-2.amazonaws.com"
};

// Create an instance of the object
var checker = new LatencyCheck(regions);

// Call the begin function
checker.begin();

// Listen for the check to complete.
checker.on('check_complete', function (results) {
    console.log(results);
});

// Listen for each region check to complete.
checker.on('region_complete', function (progress, results) {
    console.log('Current porogress': progress + '% complete');
    console.log(results);
});

// Listen for any errors so we can take the appropriate action
checker.on('error', function (err) {
    console.log(err);
});
```

