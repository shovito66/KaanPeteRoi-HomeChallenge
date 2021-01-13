/**
 * @todo: 
 * npm install exceljs  //tried for excel
 * npm install papaparse  //for csv  https://chercher.tech/protractor/csv-file-protractor
 *  tsconfig.json file--> "downlevelIteration": true,  if not work then compile with this command: tsc.cmd .\main.ts  --downLevelIteration
 * 
 * node class-->volunteer class
 */



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


var fielName: string = 'volunteer_attendance_data.csv'
const papa = require('papaparse');
const fs = require('fs');
const file = fs.readFileSync('./' + fielName, 'utf8');

// papa.parse(file, {
//     complete: (result: any) => {
//         console.log("@@@@@ Complete CSV file : " + result.data)
//         console.log("###### row: " + result.data[0])
//         console.log("****** value in a row: " + result.data[0][2])
//         console.log("****** value in a Col1 Row 2: " + result.data[1][2])

//     }
// });


class VolunteerNode {
    private volunteerId: number;
    private volunteerName: string;
    private conflictedVolunteer: VolunteerNode[]
    conflictedWeightMap = new Map<number, number>(); //ConflictvID-->Weight
    dateShiftMap = new Map<string, string>();

    constructor(volunteerId: number, volunteerName: string) {
        this.volunteerId = volunteerId
        this.volunteerName = volunteerName
        this.conflictedVolunteer = new Array()
    }


    getConflictedVolunteer(): VolunteerNode[] {
        return this.conflictedVolunteer
    }

    getVolunteerID(): number {
        return this.volunteerId
    }

    getVolunteerName(): string {
        return this.volunteerName
    }

    addConflictedVolunteer(node: VolunteerNode): void {
        this.conflictedVolunteer.push(node)
    }

}

class Graph {

    idNodeMap = new Map<number, VolunteerNode>();

    constructor() {

    }

    addNode(node: VolunteerNode, date: string, shift: string): void {

        var retriveNode: any = this.idNodeMap.get(node.getVolunteerID())
        if (retriveNode == undefined) {
            //a new node
            this.idNodeMap.set(node.getVolunteerID(), node);
            node.dateShiftMap.set(date, shift);
        } else {
            retriveNode.dateShiftMap.set(date, shift)
        }
    }

    addEdge(node:VolunteerNode,date: string, shift: string):void{
        //will check if passing node can form any edge among the nodes in the iNodeMap
        var retriveNode = this.idNodeMap.get(node.getVolunteerID()) 

        for (let element of this.idNodeMap.values()) {
            if(element!=retriveNode && element.dateShiftMap.get(date)==shift){
                if(retriveNode){ //sanity check
                    retriveNode.getConflictedVolunteer().push(element);
                    element.getConflictedVolunteer().push(retriveNode);
                    
                    var currentWeight = retriveNode.conflictedWeightMap.get(element.getVolunteerID())
                    currentWeight = currentWeight == undefined  ? 0 : currentWeight
                    retriveNode.conflictedWeightMap.set(element.getVolunteerID(),currentWeight+1)

                    currentWeight = element.conflictedWeightMap.get(retriveNode.getVolunteerID())
                    currentWeight = currentWeight == undefined  ? 0 : currentWeight
                    element.conflictedWeightMap.set(retriveNode.getVolunteerID(),currentWeight+1)
                }
                
            }
        }
    }

    printGraph(): void {
        for (let element of this.idNodeMap.values()) {
            var outputString: string = ''
            outputString = element.getVolunteerName()
            const conflictedNeighbours: VolunteerNode[] = element.getConflictedVolunteer()

            for (let j = 0; j < conflictedNeighbours.length; j++) {
                const neighbour = conflictedNeighbours[j];
                var neighbourId: number = neighbour.getVolunteerID()
                const weight = element.conflictedWeightMap.get(neighbourId)
                outputString = outputString + '\t' + neighbour.getVolunteerName + weight
            }
            console.log(outputString);
        }

    }
}


papa.parse(file, {
    Headers: false,
    complete: (result: any) => {
        // var x:number  = Number(2)
        var csvLength: number = result.data.length - 2
        var graph = new Graph();
        for (let index = 1; index < csvLength; index++) {
            const rowData = result.data[index];
            var date: string = rowData[0]
            var shift: string = rowData[1]
            var vId: number = rowData[2]
            var vName: string = rowData[3]
            var reason: string = rowData[4]
            // console.log(data+' '+shift+' '+reason)
            var newNode = new VolunteerNode(vId, vName);
            graph.addNode(newNode, date, shift);
        }

        graph.printGraph();
    }
});