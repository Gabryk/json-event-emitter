/*
 *	Test for json listener and events dispatch
 *
 */
const path = require('path');
const JsonEventEmitter = require('../index');
const file = new JsonEventEmitter({path: path.resolve(__dirname, './test.json') })


test('Start listen a json file', ()=>{
	var valueExpected = {
		hello:'This is a test',
		deepHello:{
			hello: 'Hello from deep'
		}
	};


	expect(file.getValue()).toEqual(valueExpected);
})

it('Dispatch update for property deepHello.hello', async ()=>{
	expect.assertions(1);


	/*
	 *	Make an update
	 */
	var valueExpected = {
		hello:'This is a test',
		deepHello:{
			hello: 'This is unfair'
		}
	};
	file.on('change', (changes)=>{
		expect(file.getValue()).toEqual(valueExpected);
	})
	await file.update({
		deepHello:{
			hello: 'This is unfair'
		}
	});
	file.removeAllListeners('change');
})
it('Dispatch revert update for property deepHello.hello', async ()=>{
	expect.assertions(1);


	/*
	 *	Make an update
	 */

	/*
	 *	Revert the update above
	 *	Set the next expected
	 */
	var valueExpected = {
		hello:'This is a test',
		deepHello:{
			hello: 'Hello from deep'
		}
	};
	file.on('change', (changes)=>{
		expect(file.getValue()).toEqual(valueExpected);
	})
	await file.update({
		deepHello:{
			hello: 'Hello from deep'
		}
	});
})