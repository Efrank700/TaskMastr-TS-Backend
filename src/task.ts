interface task {
    supervisor: supervisor,
    runnerRequest: boolean,
    recieveLocation: string,
    depositLocation:string,
    item?: string,
    quantity?: number
}