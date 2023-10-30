export async function host(): Promise<string> {
    const peerjs = await import('peerjs');
    const [adjective1, adjective2] = await (await fetch("https://random-word-form.repl.co/random/adjective?count=2")).json()
    const [animal] = (await (await fetch("https://random-word-form.repl.co/random/animal")).json()) as string[];

    const self = new peerjs.Peer(`${adjective1}-${adjective2}-${animal}`.toLowerCase());

    self.on('connection', async (conn) => {
        // confirmation
        const media = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: true });
        self.call(conn.peer, media);
    });

    return new Promise((resolve, _) => {
        self.on('open', resolve);
    });
}

export async function connect(peerId: string): Promise<MediaStream> {
    const peerjs = await import('peerjs');
    const self = new peerjs.Peer();

    return new Promise((resolve, _) => {
        self.on('open', (_) => {
            self.connect(peerId.toLowerCase());
            self.on('call', (media) => {
                media.on('stream', resolve);
                media.answer();
            });
        });
    });
}