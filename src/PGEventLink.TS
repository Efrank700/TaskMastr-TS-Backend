import * as pg from 'pg';
import {TaskMastrEvent, participant, admin, supervisor, runner, task} from './Event';

const client = new pg.Client({connectionString: 'TODO: CHANGE THIS'});

async function addNewEvent(eventName: string, adminKey: number, supervisorKey: number, runnerKey: number): Promise<string[]> {
    try {
        await client.connect();
        let res = await client.query(`INSERT INTO events VALUES (${eventName}, ${adminKey}, ${supervisorKey}, ${runnerKey}, '{}', '{}', '{}', '{}')`);
        if(res.rowCount !== 1) throw new Error("ILLEGAL NUMBER OF ROW MODIFICATIONS");
        let retArr: string[] = [];
        res.rows.forEach((element) => {
            retArr.push("" + element)
        });
        return new Promise<string[]>((resolve) => {
            let localArr = retArr;
            resolve(localArr)
        })
    }
    catch(error) {
        return new Promise<string[]>((resolve, reject) => {
            reject(["" + error]);
        })
    }
}

async function eventExistsByName(eventName: string) : Promise<boolean> {
    try {
        let res = await client.query(`SELECT * FROM events WHERE event_name = ${eventName}`);
        let retVal = res.rowCount >= 1;
        return new Promise<boolean>((resolve) => {
            resolve(retVal);
        })
    }
    catch(error) {
        
    }
}