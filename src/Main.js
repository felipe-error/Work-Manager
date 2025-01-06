import term from "terminal-kit";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const app = term.terminal;
const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname + "/config.json")));
const wList = JSON.parse(readFileSync(join(__dirname, config.srcFile)));
// simpleWork: 1... 3 day
// mediumWork: 1... 2 week
// complexWork: 1... 6 mouth

const context = {
	state: "NaN",
	mode: {
		edit() {
			resetIn();
			app.clear();

			app.yellow("< Edit Mode > \n\n");
			exit();
		},
		select() {
			resetIn();
			app.clear();

			app.yellow("< Select Mode > \n\n");

			const options = ["Simple Work", "Medium Work", "Complex Work"];
			app.singleColumnMenu(options, (error, response) => {
				let arr = [];
				switch (response.selectedIndex) {
					case 0:
						arr = workArr(wList["simpleWork"]);
						printItems(arr, "simpleWork");
						break;
					case 1:
						arr = workArr(wList["mediumWork"]);
						printItems(arr, "mediumWork");
						break;
					case 2:
						arr = workArr(wList["complexWork"]);
						printItems(arr, "complexWork");
						break;
				}
			});
		},
		async insert() {
			resetIn();
			app.clear();

			app.yellow("< Insert Mode > \n\n");

			app.blue("Insert Work Type: \n");
			let key = await recv();
			app.blue("\nInsert Work name: \n");
			let name = await recv();
			app.blue("\nInsert Work Description: \n");
			let description = await recv();

			pushWork(name, description, key);
			save();
			//backMenu();
		},
	},
};

function createWork(_name, _description) {
	const work = {
		name: _name,
		description: _description,
		complet: false,
	};
	return work;
}
function pushWork(_name, _objective, _key) {
	const work = createWork(_name, _objective);
	wList[_key].push(work);
}

function workArr(_items) {
	let arr = [];

	for (let o of _items) {
		let char = o.complet == true ? " c" : " x";
		const obj = o.name + char;

		arr.push(obj);
	}
	return arr;
}

function printItems(_items, _type) {
	resetIn();

	app.gridMenu(_items, (error, response) => {
		checkItem(response.selectedIndex, _type);
	});
}

function resetIn() {
	app.grabInput(false);
	app.grabInput(true);
}

function checkItem(_index, _type) {
	resetIn();
	app.clear();
	app.yellow("< Checking item %s in %s > \n\n", _index, _type);
	const tempArr = wList[_type];
	let char = tempArr[_index].complet === true ? "c" : "x";
	app.green("Name: " + tempArr[_index].name + "\n\n");
	app.brightBlue("Description: " + tempArr[_index].description + "\n");
	let options = ["Complet: ( " + char + " )", "\t Back: ->\n\n"];
	app.singleLineMenu(options, (error, response) => {
		switch (response.selectedIndex) {
			case 0:
				tempArr[_index].complet =
					tempArr[_index].complet === true ? false : true;
				save();
				backMenu();
				break;
			case 1:
				backMenu();
				break;
		}
	});
}

async function recv() {
	var input = await app.inputField().promise;

	return input;
}

function save() {
	const sList = JSON.parse(JSON.stringify(wList));
	sList.simpleWork = wList.simpleWork.filter((work) => work.name !== "NaN");
	sList.mediumWork = wList.mediumWork.filter((work) => work.name !== "NaN");
	sList.complexWork = wList.complexWork.filter((work) => work.name !== "NaN");

	writeFileSync(join(__dirname, config.srcFile), JSON.stringify(sList), "utf8");
	console.log(sList);
	exit();
}

function cancelProcIn() {
	app.on("key", function (name, matches, data) {
		if (name === "CTRL_C") {
			exit();
		}
	});
}

function start() {
	app.green("Work Manager \n");

	const options = ["Edit Works", "Insert Works", "Select Works", "close"];
	app.singleColumnMenu(options, (error, response) => {
		if (response.selectedIndex == 0) {
			context.state = "edit";
			context.mode["edit"]();
		} else if (response.selectedIndex == 1) {
			context.state = "insert";
			context.mode["insert"]();
		} else if (response.selectedIndex == 2) {
			context.state = "select";
			context.mode["select"]();
		} else {
			exit();
		}
	});
}

function exit() {
	process.exit();
}
function backMenu() {
	resetIn();
	main();
}

function main() {
	app.clear();
	start();
}

pushWork("NaN", "'Undefined'", "simpleWork");
pushWork("NaN", "'Undefined'", "mediumWork");
pushWork("NaN", "'Undefined'", "complexWork");

cancelProcIn();
main();
