"use strict";
/**
 * @todo:
 * npm install exceljs  //tried for excel
 * npm install papaparse  //for csv  https://chercher.tech/protractor/csv-file-protractor
 *  tsconfig.json file--> "downlevelIteration": true,  if not work then compile with this command: tsc.cmd .\main.ts  --downLevelIteration
 *
 * node class-->volunteer class
 */
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
/**
    import { Workbook, Row, Cell, Worksheet } from 'exceljs';

    let wb: Workbook = new Workbook();

    var fileName: string = "volunteer_attendance_data.xlsx"; //edit this for a different fileName

    wb.xlsx.readFile("./volunteer_attendance_data.xlsx").then(function () {
        //sheet object
        let sheet: Worksheet = wb.getWorksheet("Sheet1");

        var totalRowsIncludingEmptyRows:any = sheet.columnCount
        console.log("total nuumber of rows : " + totalRowsIncludingEmptyRows)
        // loop till end of row

        for (let i = 1; i <= totalRowsIncludingEmptyRows; i++) {
            let cellValue = sheet.getRow(i).getCell(2).toString();
            console.log("Column B value from the row '" + i + "' : " + cellValue)
        }
    }
    )
 */
var fielName = 'volunteer_attendance_data.csv';
var papa = require('papaparse');
var fs = require('fs');
var file = fs.readFileSync('./' + fielName, 'utf8');
// papa.parse(file, {
//     complete: (result: any) => {
//         console.log("@@@@@ Complete CSV file : " + result.data)
//         console.log("###### row: " + result.data[0])
//         console.log("****** value in a row: " + result.data[0][2])
//         console.log("****** value in a Col1 Row 2: " + result.data[1][2])
//     }
// });
var VolunteerNode = /** @class */ (function () {
    function VolunteerNode(volunteerId, volunteerName) {
        this.dictionaryWeight = new Map();
        this.dateShiftMap = new Map();
        this.volunteerId = volunteerId;
        this.volunteerName = volunteerName;
        this.conflictedVolunteer = new Array();
    }
    VolunteerNode.prototype.getConflictedVolunteer = function () {
        return this.conflictedVolunteer;
    };
    VolunteerNode.prototype.getVolunteerID = function () {
        return this.volunteerId;
    };
    VolunteerNode.prototype.getVolunteerName = function () {
        return this.volunteerName;
    };
    VolunteerNode.prototype.addConflictedVolunteer = function (node) {
        this.conflictedVolunteer.push(node);
    };
    return VolunteerNode;
}());
var Graph = /** @class */ (function () {
    function Graph() {
        this.idNodeMap = new Map();
    }
    Graph.prototype.addNode = function (node, date, shift) {
        var retriveNode = this.idNodeMap.get(node.getVolunteerID());
        if (retriveNode == undefined) {
            //a new node
            this.idNodeMap.set(node.getVolunteerID(), node);
            node.dateShiftMap.set(date, shift);
        }
        else {
            retriveNode.dateShiftMap.set(date, shift);
        }
    };
    Graph.prototype.printGraph = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.idNodeMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var element = _c.value;
                var outputString = '';
                outputString = element.getVolunteerName();
                var conflictedNeighbours = element.getConflictedVolunteer();
                for (var j = 0; j < conflictedNeighbours.length; j++) {
                    var neighbour = conflictedNeighbours[j];
                    var neighbourId = neighbour.getVolunteerID();
                    var weight = element.dictionaryWeight.get(neighbourId);
                    outputString = outputString + '\t' + neighbour.getVolunteerName + weight;
                }
                console.log(outputString);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return Graph;
}());
papa.parse(file, {
    Headers: false,
    complete: function (result) {
        // var x:number  = Number(2)
        var csvLength = result.data.length - 2;
        var graph = new Graph();
        for (var index = 1; index < csvLength; index++) {
            var rowData = result.data[index];
            var date = rowData[0];
            var shift = rowData[1];
            var vId = rowData[2];
            var vName = rowData[3];
            var reason = rowData[4];
            // console.log(data+' '+shift+' '+reason)
            var newNode = new VolunteerNode(vId, vName);
            graph.addNode(newNode, date, shift);
        }
        graph.printGraph();
    }
});
