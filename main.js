"use strict";
/**
 * Shovito Barua Soumma
 * @todo:
 * npm install exceljs  //tried for excel
 * npm install papaparse  //for csv  https://chercher.tech/protractor/csv-file-protractor
 * tsconfig.json file--> "downlevelIteration": true,  if not work then compile with this command: tsc.cmd .\main.ts  --downLevelIteration
 * npm i -s csv-writer (for exporting CSV file)
 * Change fileName variable... FILE MUST BE IN CSV FORMAT
 * tsc.cmd --module amd .\main.ts --downlevelIteration
 *
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
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
var fielName = 'volunteer_attendance_data.csv';
var papa = require('papaparse');
var fs = require('fs');
var file = fs.readFileSync('./' + fielName, 'utf8');
/**
 * papa.parse(file, {
        complete: (result: any) => {
            console.log("@@@@@ Complete CSV file : " + result.data)
            console.log("###### row: " + result.data[0])
            console.log("****** value in a row: " + result.data[0][2])
            console.log("****** value in a Col1 Row 2: " + result.data[1][2])

        }
    });

 * * */
var VolunteerNode = /** @class */ (function () {
    function VolunteerNode(volunteerId, volunteerName) {
        this.conflictedWeightMap = new Map(); //ConflictvID-->Weight
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
        this.addEdge(node, date, shift);
    };
    Graph.prototype.addEdge = function (node, date, shift) {
        var e_1, _a;
        //will check if passing node can form any edge among the nodes in the iNodeMap
        var retriveNode = this.idNodeMap.get(node.getVolunteerID()); //incoming node is already there
        try {
            for (var _b = __values(this.idNodeMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var element = _c.value;
                if (element.dateShiftMap.get(date) == shift && element != retriveNode) {
                    if (retriveNode) { //sanity check
                        var retriveNodeConflictedArray = retriveNode.getConflictedVolunteer();
                        var index = retriveNodeConflictedArray.indexOf(element);
                        var elementNodeConflictedArray = element.getConflictedVolunteer();
                        var index2 = elementNodeConflictedArray.indexOf(retriveNode);
                        if (index == -1) {
                            retriveNode.getConflictedVolunteer().push(element);
                        }
                        if (index2 == -1) {
                            element.getConflictedVolunteer().push(retriveNode);
                        }
                        var currentWeight = retriveNode.conflictedWeightMap.get(element.getVolunteerID());
                        currentWeight = currentWeight == undefined ? 0 : currentWeight;
                        retriveNode.conflictedWeightMap.set(element.getVolunteerID(), currentWeight + 1);
                        currentWeight = element.conflictedWeightMap.get(retriveNode.getVolunteerID());
                        currentWeight = currentWeight == undefined ? 0 : currentWeight;
                        element.conflictedWeightMap.set(retriveNode.getVolunteerID(), currentWeight + 1);
                    }
                }
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
    Graph.prototype.printGraph = function () {
        var e_2, _a;
        try {
            for (var _b = __values(this.idNodeMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var element = _c.value;
                var outputString = '';
                outputString = outputString + element.getVolunteerName() + "\t-->";
                var conflictedNeighbours = element.getConflictedVolunteer();
                for (var j = 0; j < conflictedNeighbours.length; j++) {
                    var neighbour = conflictedNeighbours[j];
                    var neighbourId = neighbour.getVolunteerID();
                    var weight = element.conflictedWeightMap.get(neighbourId);
                    outputString = outputString + '\t' + neighbour.getVolunteerName() + ':' + weight;
                }
                console.log(outputString);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Graph.prototype.exportToCSV = function () {
        var e_3, _a;
        var csvWriter = createCsvWriter({
            path: 'output.csv',
            header: [
                { id: 'node1', title: 'Node1' },
                { id: 'node2', title: 'Node2' },
                { id: 'weight', title: 'weight' },
            ]
        });
        var data = [];
        try {
            for (var _b = __values(this.idNodeMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var element = _c.value;
                var node1 = element.getVolunteerName();
                var conflictedNeighbours = element.getConflictedVolunteer();
                for (var j = 0; j < conflictedNeighbours.length; j++) {
                    var neighbour = conflictedNeighbours[j];
                    var neighbourId = neighbour.getVolunteerID();
                    var weight = element.conflictedWeightMap.get(neighbourId);
                    var node2 = neighbour.getVolunteerName();
                    data.push({
                        node1: node1,
                        node2: node2,
                        weight: weight
                    });
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        csvWriter
            .writeRecords(data)
            .then(function () { return console.log('The CSV file was written successfully'); });
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
            // graph.addEdge(newNode, date, shift)
        }
        graph.printGraph();
        graph.exportToCSV();
    }
});
