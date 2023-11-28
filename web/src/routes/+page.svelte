<script lang="ts">
	import { requestStream, hostStream } from '$lib';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { toCanvas } from 'qrcode';

	/**
	 * k-v pairs used to setup the app
	 */
	const PARAM_KEYS = {
		ID: 'id'
	};

	enum MODE {
		HOST,
		JOINING,
		JOINED,
		IDLE
	}

	const id = writable('');
	const stream = writable<MediaStream>();
	const mode = writable(MODE.IDLE);

	class Node {
		static setupQRCode(canvas: HTMLCanvasElement) {
			toCanvas(canvas, `${window.location.origin}?${PARAM_KEYS.ID}=${$id}`, console.error);
		}

		static setupVideo(video: HTMLVideoElement) {
			video.srcObject = $stream;
			video.style.display = 'block';
		}
	}

	class System {
		static async host() {
			$id = await hostStream();
			$mode = MODE.HOST;

			const url = new URL(window.location.href);
			url.searchParams.set(PARAM_KEYS.ID, $id);
			window.history.replaceState(null, 'Mintoro', url);
		}

		static async request(id: string) {
			const url = new URL(window.location.href);
			url.searchParams.delete(PARAM_KEYS.ID);
			window.history.pushState(null, 'Mintoro', url);

			$mode = MODE.JOINING;
			$stream = await requestStream(id);
			$mode = MODE.JOINED;
		}

		static reset() {
			$id = '';
			$mode = MODE.IDLE;
		}
	}

	onMount(async () => {
		const params = new URLSearchParams(location.search);
		$id = params.get(PARAM_KEYS.ID) ?? '';
		if ($id.length > 0) System.request($id);
	});
</script>

<section class="w-screen min-h-screen grid justify-items-center p-4">
	<div class="m-auto grid gap-5 justify-items-center">
		<h1 class="title text-5xl pb-10">🖥️ Mintoro</h1>
		{#if $mode == MODE.HOST}
			<canvas id="qrcode" use:Node.setupQRCode />
			<button class="btn btn-wide"> {$id} </button>
			<button class="btn btn-wide btn-secondary" on:click={System.reset}> Back </button>
		{:else if $mode == MODE.JOINED}
			<video id="screen-share" autoplay controls use:Node.setupVideo>
				<track kind="captions" />
			</video>
			<button class="btn btn-wide btn-secondary" on:click={System.reset}> Back </button>
		{:else if $mode == MODE.JOINING}
			<pre class="text-center">requesting stream from <br /><strong>{$id}</strong></pre>
			<svg width="200">
				<image
					xlink:href="https://gist.githubusercontent.com/ndbaker1/0d7d1faec88170b3265e379c75764d1c/raw/dc859fda2fe372cff1eed788dc5c734546349cb6/loader.svg"
				/>
			</svg>
			<button class="btn btn-wide btn-secondary" on:click={System.reset}> Back </button>
		{:else if $mode == MODE.IDLE}
			<form on:submit={() => System.request($id)} class="w-full">
				<input
					type="text"
					placeholder="enter a stream id"
					bind:value={$id}
					class="input input-bordered input-secondary w-full"
				/>
			</form>
			{#if $id.length > 0}
				<button class="btn btn-wide btn-secondary" on:click={() => System.request($id)}>
					Join
				</button>
			{:else}
				<button class="btn btn-wide btn-secondary" on:click={System.host}> Host </button>
			{/if}
		{/if}
	</div>
</section>

<footer class="fixed bottom-5 left-5" style="color: #888888">
	quick starting points for virtual displays on
	<a href="https://github.com/pavlobu/deskreen/issues/42"> Linux </a>
	and
	<a href="https://github.com/MolotovCherry/virtual-display-rs"> Windows </a>
</footer>

<style>
	.title {
		font-weight: bolder;
		background: -webkit-linear-gradient(#5900be, #3700b6);
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	#screen-share {
		max-width: 80%;
		max-height: 80%;
	}

	a {
		color: rgb(61, 180, 154);
	}
</style>
