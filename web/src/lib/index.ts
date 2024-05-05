import { getAdjectives, getAnimal } from './assets';

/**
 * Returns an ID to join the host stream
 * @returns ID of the stream hoster
 */
export async function hostStream(): Promise<string> {
	const peerjs = await import('peerjs');
	const [adjective1, adjective2] = getAdjectives(2);
	const animal = getAnimal();
	const id = `${adjective1}-${adjective2}-${animal}`.toLowerCase();

	const self = new peerjs.Peer(id);

	self.on('connection', async (conn) => {
		// confirmation
		const media = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: true });
		self.call(conn.peer, media);
	});

	return new Promise((resolve, _) => {
		self.on('open', resolve);
	});
}

/**
 * Requests a host ID for the stream data
 * @param peerId id of the host to watch a stream for
 * @returns the {MediaStream}
 */
export async function requestStream(peerId: string): Promise<MediaStream> {
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
