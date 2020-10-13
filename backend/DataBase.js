const { MongoClient, ObjectID } = require('mongodb');

const url =
  'mongodb+srv://AlexanderR:HamsterGoHam2020!@hamsterwars0.hblqj.gcp.mongodb.net/HamsterGoHam?retryWrites=true&w=majority';
const dbName = 'HamsterGoHam';
const collectionName = 'Hamsters';


function getAllHamsters(callback) {
  get({}, callback);
}

// function deleteBoat(_id,callback){
// 	del(_id, callback)
// }

// function addBoat(reqestsBody,callback){
// 	addShip(reqestsBody, callback)
// }

//the functions called above
function get(filter, callback) {
  const fil = {};

  if (filter.id2) {
    fil.id = { $in: [parseInt(filter.id1), parseInt(filter.id2)] };
  }

  console.log('MESSAGE', filter.id2);
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        callback('"connection problem"');
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      try {
        const cursor = await col.find(fil); //why is named cursor
        const array = await cursor.toArray();
        callback(array);
        console.log('Za ARRAY', array);
      } catch (error) {
        console.log('Query error: ' + error.message);
        callback('"ERROR!! Query error"');
      } finally {
        client.close();
      }
    }
  );
}

function matchResult(id, callback) {
  const toObj = JSON.parse(id.id);
  console.log('WHAT ABOUT NOW?', toObj);

  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        callback('"connection problem"');
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      try {
        if (Object.keys(toObj)[0] === 'red') {
          const result = await col.findOneAndUpdate(
            { id: parseInt(toObj.red) },
            { $inc: { wins: 1, games: 1 } }
          );
          result = await col.findOneAndUpdate(
            { id: parseInt(toObj.blue) },
            { $inc: { defeats: 1, games: 1 } }
          );
        }
        if (Object.keys(toObj)[0] === 'blue') {
          const result = await col.findOneAndUpdate(
            { id: parseInt(toObj.blue) },
            { $inc: { wins: 1, games: 1 } }
          );
          result = await col.findOneAndUpdate(
            { id: parseInt(toObj.red) },
            { $inc: { defeats: 1, games: 1 } }
          );
        }

        callback({
          result: result.result,
          ops: result.ops,
        });
      } catch (error) {
        console.log('Query error: ' + error.message);
        callback('"ERROR!! Query error"');
      } finally {
        client.close();
      }
    }
  );
}



function search(query, callback) {
	console.log(query)
	const filter = {};
	let sortFilter = {};
	if( query.name) {
		filter.name = { "$regex":query.name, $options: '-i'};
	}
	if(query.matchCount || query.winRate) {
		let orderGames = null;
		let orderWins = null;
		if(query.matchCount === 'MM'){
			orderGames = 1;	
		}else{
			orderGames = 1;
		}
		if(query.winRate === 'HWR'){
			orderWins = 1
		}else{
			orderWins = 1
		} 
		sortFilter = {games: orderGames,wins: orderWins}
	}
	


	MongoClient.connect(
		url,
		{ useUnifiedTopology: true },
		async (error, client) => {
			if( error ) {
				callback('"ERROR!! Could not connect"');
				return;  // exit the callback function
			}
			const col = client.db(dbName).collection(collectionName);
			try {
				console.log('what is the filter', filter)
				
				console.log(sortFilter);
				const cursor = await col.find(filter).sort(sortFilter);
				const array = await cursor.toArray();
				console.log('WHAT IS THE ARRRAAATYTTYY',array)

				callback(array);

			} catch(error) {
				console.log('Query error: ' + error.message);
				callback('"ERROR!! Query error"');

			} finally {
				client.close();
			}
		}
	)
}

function addHamster(requestsBody, callback) {
  const doc = requestsBody;
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        callback('"connection problem"');
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      try {
        const result = await col.insertOne(doc);
        callback({
          result: result.result,
          ops: result.ops,
        });
      } catch (error) {
        console.error('addHamster error: ' + error.message);
        callback('"ERROR!! Query error"');
      } finally {
        client.close();
      }
    }
  );
}

module.exports = {
  getAllHamsters,
  search,
  addHamster,
  get,
  matchResult,
};
