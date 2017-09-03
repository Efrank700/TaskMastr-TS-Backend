import {task} from "./task"
export {task}
export interface participant {
    screenName: string,
    roomName: string,
    socketId: number
}

enum participantTypes {
    admin, supervisor, runner
}
export interface upperLevelWorker extends participant{
    screenName: string,
    roomName: string,
    tasks: task[],
    socketId: number
}
export interface admin extends upperLevelWorker{
    screenName: string,
    roomName: string,
    tasks: task[],
    location: string | null,
    socketId: number
}

export interface supervisor extends upperLevelWorker{
    screenName: string,
    roomName: string,
    location: string,
    tasks: task[],
    socketId: number
}

export interface runner extends participant{
    screenName: string,
    roomName: string,
    task: task | null,
    socketId: number
}