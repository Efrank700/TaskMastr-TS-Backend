interface participant {
    screenName: string,
    roomName: string
}

enum participantTypes {
    admin, supervisor, runner
}

interface admin extends participant{
    screenName: string;
    roomName: string;
    location: string | null;
}

interface supervisor extends participant{
    screenName: string;
    roomName: string;
    location: string;
}

interface runner extends participant{
    screenName: string;
    roomName: string;
    task: task | null;
}