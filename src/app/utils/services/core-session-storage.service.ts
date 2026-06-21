import { computed, effect, Injectable, signal } from '@angular/core';
import { CoreEnum } from '@utils/enums';
import { CatalogueInterface, DpaInterface } from '@utils/interfaces';
import { ActivityInterface, CategoryInterface, ClassificationInterface } from '@/pages/core/shared/work-flows';
import { CadastreInterface, EstablishmentInterface } from '@/pages/core/work-flows';

const STORAGE_KEY = 'process_state';

export interface ProcessI {
    processId?: string;
    establishmentId?: string;
    activity?: ActivityInterface;
    classification?: ClassificationInterface;
    category?: CategoryInterface;
    province?: DpaInterface;
    type?: CatalogueInterface;
}

export interface ProcessStep2I {
    totalMen?: number;
    totalMenDisability?: number;
    totalWomen?: number;
    totalWomenDisability?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CoreSessionStorageService {
    private readonly encryptionKey: string = 'rQg47X9@RkK9Vky#2U2xZ@hSB71zleXt';

    private _processSignal = signal<any>({});
    readonly processSignal = this._processSignal.asReadonly();

    private _process = signal<ProcessI | null>(null);
    private _cadastre = signal<CadastreInterface | null>(null);
    private _establishment = signal<EstablishmentInterface | null>(null);

    process = this._process.asReadonly();
    cadastre = this._cadastre.asReadonly();
    establishment = this._establishment.asReadonly();

    fullProcess = computed(() => ({
        process: this._process(),
        cadastre: this._cadastre(),
        establishment: this._establishment()
    }));

    setProcess(data: ProcessI) {
        this._process.set(data);
    }

    setCadastre(data: CadastreInterface) {
        this._cadastre.set(data);
    }

    setEstablishment(data: EstablishmentInterface) {
        this._establishment.set(data);
    }

    clearAll() {
        this._process.set(null);
        this._cadastre.set(null);
        this._establishment.set(null);
    }

    constructor() {
        this.loadInitialSignal().then();
        this.loadFromStorage();

        // guarda automáticamente cada vez que cambia algo
        effect(() => {
            const data = this.fullProcess();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        });
    }

    private loadFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const data = JSON.parse(stored);

        this._process.set(data.process);
        this._cadastre.set(data.cadastre);
        this._establishment.set(data.establishment);
    }

    async setEncryptedValue(key: string, newValue: any): Promise<void> {
        const cryptoKey = await this.generateCryptoKey();
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const oldValue = await this.getEncryptedValue(key);
        const value = { ...oldValue, ...newValue };

        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv
            },
            cryptoKey,
            encoder.encode(JSON.stringify(value))
        );

        const dataToStore = {
            iv: this.arrayBufferToBase64(iv.buffer),
            value: this.arrayBufferToBase64(new Uint8Array(encryptedData).buffer)
        };

        sessionStorage.setItem(key, JSON.stringify(dataToStore));

        this.updateSignals(key, value);
    }

    updateSignals(key: string, value: any) {
        switch (key) {
            case CoreEnum.process:
                this._processSignal.set(value);
                break;
            case CoreEnum.cadastre:
                this._processSignal.set(value);
                break;
            case CoreEnum.establishment:
                this._processSignal.set(value);
                break;
        }
    }

    // Método para obtener datos desde el session storage y desencriptarlos
    async getEncryptedValue(key: string | null): Promise<any> {
        if (!key) {
            return null;
        }

        const item = sessionStorage.getItem(key);

        if (!item) return null; // Si no hay datos, retornar null

        const { iv, value } = JSON.parse(item);
        const ivBytes = this.base64ToArrayBuffer(iv);
        const encryptedDataBytes = this.base64ToArrayBuffer(value);

        const cryptoKey = await this.generateCryptoKey();

        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ivBytes
            },
            cryptoKey,
            encryptedDataBytes
        );

        const decoder = new TextDecoder();

        return JSON.parse(decoder.decode(decryptedData));
    }

    private async loadInitialSignal() {
        let decryptedValue = await this.getEncryptedValue(sessionStorage.getItem(CoreEnum.process));

        this._processSignal.set(decryptedValue);
    }

    private async generateCryptoKey(): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.encryptionKey);
        return await crypto.subtle.importKey(
            'raw', // Tipo de clave
            keyData, // Datos de la clave
            { name: 'AES-GCM' }, // Algoritmo
            false, // No se puede exportar la clave generada
            ['encrypt', 'decrypt'] // Permitir encriptar y desencriptar
        );
    }

    // Utilidades para trabajar con Base64
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
        return window.btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = window.atob(base64);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        return buffer.buffer;
    }
}
