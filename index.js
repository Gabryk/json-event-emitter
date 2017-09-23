const fs = require('fs');
const EventEmitter = require('events');

function objectAssign(obj, update, objStack=[]) {
	var changes = [], subChanges=[];
	var properties = Object.keys(update);
	properties.forEach(name=>{
		try{
			if (typeof update[name] != 'object' && obj[name] !== update[name]){
				changes.push({
					property: name,
					newValue: update[name], oldValue: obj[name]
				});
				obj[name] = update[name];
			}
			else if(Array.isArray(update[name])){
				obj[name] = update[name];
			}
			else{
				if(obj[name]==undefined) 
					obj[name]={}
				/* 	Evade cicle calls 	*/
				if (objStack.find(o=>o==update[name])) {
					obj[name] = update[name];
					return 1;
				}else{
					objStack.push(update[name]);
					subChanges = objectAssign(obj[name], update[name], objStack);
				}
				if (subChanges.length>0){
					changes.push({
						property: name,
						changes: subChanges
					});
				}
			}
		}catch(err){
			console.log(`> Error objectAssign update. Prop ${name}`);
			console.error(err);
		}
	});
	return changes;
}
class JsonEventEmitter extends EventEmitter {
	constructor(options={}){
		super();
		options = {
			start: options.start?options.start: true,
			path: options.path?options.path: undefined,
		};
		this._value = {};
		this._pathFile = options.path;
		this._watcher;

		if (options.start) {
			this.read();
			this.startWatch();
		}
	}

	getValue(){
		return this._value;
	}
	setValue(value){
		this._value = value;
	}
	update(obj){
		var changes = objectAssign(this._value, obj);
		if (changes.length > 0) {
			this.emit('change', changes);
			return this.save();
		}
		return Promise.reject('Nothing to update');
	}
	read() {
		if (this.status=='reading')
			return this._value;

		this.status = 'reading';
		var data = fs.readFileSync(this._pathFile);
		if (!data) {
			return new Error(`Invalid json file path: ${this._pathFile}`);
		}
		var jString = data.toString();
		try{
			var obj = JSON.parse(jString);
		}catch(err){
			throw err;
		}
		this.status = 'load';
		this.setValue(obj);
		return this.getValue();
	}
	save() {
		return new Promise((resolve,reject)=>{
			if (!this._pathFile) {
				reject(`Invalid json file path`);
			}
			var jString;
			try{
				jString = JSON.stringify(this._value, undefined, 4);
			}catch(err){
				return reject(err);
			}
			fs.writeFile(this._pathFile, jString, (err)=>{
				if (err) {
					return reject(err);
				}
				resolve(this._value);
			});
		})
	}
	startWatch(){
		if (!this._pathFile) {
			throw new Error(`Invalid json file path`);
		}
		if (this._watcher) 
			return 0;
		var unstable;
		this._watcher = fs.watch(this._pathFile, (eventType, filename)=>{
			clearTimeout(unstable);

			unstable = setTimeout(()=>{
				this.read()
			}, 5000);
		});
	}
}

module.exports = JsonEventEmitter