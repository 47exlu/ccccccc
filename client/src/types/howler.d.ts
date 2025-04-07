declare module 'howler' {
  export class Howl {
    constructor(options: HowlOptions);
    play(spriteOrId?: string | number): number;
    pause(id?: number): this;
    stop(id?: number): this;
    volume(volume?: number, id?: number): this | number;
    loop(loop?: boolean, id?: number): this | boolean;
    seek(seek?: number, id?: number): this | number;
    playing(id?: number): boolean;
    duration(id?: number): number;
    state(): string;
    on(event: string, callback: Function, id?: number): this;
    once(event: string, callback: Function, id?: number): this;
    off(event: string, callback?: Function, id?: number): this;
    mute(muted?: boolean, id?: number): this | boolean;
  }

  export class Howler {
    static volume(volume?: number): number | this;
    static mute(muted?: boolean): boolean | this;
    static codecs(ext: string): boolean;
    static unload(): void;
  }

  export interface HowlOptions {
    src: string | string[];
    volume?: number;
    html5?: boolean;
    loop?: boolean;
    preload?: boolean;
    autoplay?: boolean;
    mute?: boolean;
    sprite?: { [key: string]: [number, number] | [number, number, boolean] };
    rate?: number;
    pool?: number;
    format?: string[];
    onload?: () => void;
    onloaderror?: (soundId: number, error: unknown) => void;
    onplay?: (soundId: number) => void;
    onplayerror?: (soundId: number, error: unknown) => void;
    onend?: (soundId: number) => void;
    onpause?: (soundId: number) => void;
    onstop?: (soundId: number) => void;
    onmute?: (soundId: number) => void;
    onvolume?: (soundId: number) => void;
    onrate?: (soundId: number) => void;
    onseek?: (soundId: number) => void;
    onfade?: (soundId: number) => void;
    onunlock?: () => void;
  }
}