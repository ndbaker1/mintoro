<script lang="ts">
	import { connect, host } from '$lib';
	import { writable } from 'svelte/store';

	enum MODE {
		HOST = 0,
		JOIN = 1
	}

	const id = writable('');
	const videoElement = writable<HTMLVideoElement>();
	const mode = writable(MODE.JOIN);
</script>

<section class="w-screen min-h-screen flex flex-col p-4">
	<div class="m-auto grid gap-5 justify-items-center">
		<h1 class="title text-5xl pb-10">🖥️ Monitoro</h1>
		{#if $videoElement?.srcObject == null}
			{#if $mode == MODE.HOST}
				<button
					class="btn btn-wide"
					on:click={async () => {
						await navigator.clipboard.writeText($id);
					}}>{$id}</button
				>
				<button class="btn btn-wide btn-secondary" on:click={() => ($mode = MODE.JOIN)}
					>Go Back</button
				>
			{:else}
				<form
					on:submit={async () => {
						const stream = await connect($id);
						$videoElement.srcObject = stream;
						$videoElement.style.display = 'block';
					}}
					class="w-full"
				>
					<input type="text" bind:value={$id} class="input input-bordered input-secondary w-full" />
				</form>

				<button
					class="btn btn-wide btn-secondary"
					on:click={async () => {
						const hostId = await host();
						$id = hostId;
						$mode = MODE.HOST;
					}}>Host</button
				>
			{/if}
		{/if}
	</div>

	<video bind:this={$videoElement} autoplay controls style="display: none;">
		<track kind="captions" />
	</video>
</section>

<style>
	.title {
		font-weight: bolder;
		background: -webkit-linear-gradient(#5900be, #3700b6);
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
