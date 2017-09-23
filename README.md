# json-event-emitter
A watcher for JSON files handler by EventEmitter


### Tech
This module is base in others modules (fs, events)


### Installation
```sh
$ npm install -s json-event-emitter
```
### Creating instance from file path
Our test.json file
```json
{
    "hello": "This is a test",
    "deepHello": {
        "hello": "Hello from deep"
    }
}
```
Create instance
```js
const path = require('path');
const JsonEventEmitter = require('json-event-emitter');

var someJson = new JsonEventEmitter({
	path: path.resolve(__dirname, 'test.json')
});
//  Get the data as JS Object
console.log(someJson.getValue())
```
### Updating changes
Modify a specific property change on the JSON file.
```js
someJSON.update({
	deepHello:{
		hello: 'This is unfair'
	}
});
```
### Listening events change
Register a function that is executed when a change is made.
```js
someJson.on('change', (changes, value)=>{
	console.log("This changes where apply", changes);
})
```