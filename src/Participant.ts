interface participant {
    screenName: string,
    roomName: string,
    socketId: number
}

enum participantTypes {
    admin, supervisor, runner
}

interface admin extends participant{
    screenName: string;
    roomName: string;
    tasks: task[];
    location: string | null;
    socketId: number;
}

interface supervisor extends participant{
    screenName: string;
    roomName: string;
    location: string;
    tasks: task[];
    socketId: number;
}

interface runner extends participant{
    screenName: string;
    roomName: string;
    task: task | null;
    socketId: number;
}