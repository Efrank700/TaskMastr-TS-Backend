import {upperLevelWorker} from "./Participant"
export interface task {
    supervisor: upperLevelWorker,
    runnerRequest: boolean,
    recieveLocation: string,
    depositLocation:string,
    item?: string,
    quantity?: number
}