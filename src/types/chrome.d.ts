declare namespace chrome {
  export namespace storage {
    export interface StorageChange {
      newValue?: any;
      oldValue?: any;
    }

    export interface StorageChanges {
      [key: string]: StorageChange;
    }

    export interface StorageArea {
      get<T>(keys: string | string[] | null): Promise<T>;
      set(items: { [key: string]: any }): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
    }

    export const local: StorageArea;
    export const sync: StorageArea;

    export const onChanged: {
      addListener(
        callback: (changes: StorageChanges, areaName: string) => void,
      ): void;
      removeListener(
        callback: (changes: StorageChanges, areaName: string) => void,
      ): void;
      hasListeners(): boolean;
    };
  }

  export namespace alarms {
    export interface Alarm {
      name: string;
      scheduledTime: number;
      periodInMinutes?: number;
    }

    export interface AlarmCreateInfo {
      when?: number;
      delayInMinutes?: number;
      periodInMinutes?: number;
    }

    export function create(name: string, alarmInfo: AlarmCreateInfo): void;
    export function clear(name: string): Promise<boolean>;
    export function clearAll(): Promise<boolean>;
    export function get(name: string): Promise<Alarm | undefined>;
    export function getAll(): Promise<Alarm[]>;

    export const onAlarm: {
      addListener(callback: (alarm: Alarm) => void): void;
      removeListener(callback: (alarm: Alarm) => void): void;
      hasListener(callback: (alarm: Alarm) => void): boolean;
    };
  }

  export namespace notifications {
    export type TemplateType = "basic" | "image" | "list" | "progress";

    export interface NotificationOptions {
      type: TemplateType;
      iconUrl: string;
      title: string;
      message: string;
      contextMessage?: string;
      priority?: 0 | 1 | 2;
      eventTime?: number;
      buttons?: {
        title: string;
        iconUrl?: string;
      }[];
      imageUrl?: string;
      items?: {
        title: string;
        message: string;
      }[];
      progress?: number;
      requireInteraction?: boolean;
      silent?: boolean;
    }

    export function create(
      notificationId: string | undefined,
      options: NotificationOptions,
    ): Promise<string>;

    export function clear(notificationId: string): Promise<boolean>;
    export function getAll(): Promise<{ [key: string]: NotificationOptions }>;
    export function getPermissionLevel(): Promise<"granted" | "denied">;

    export const onClicked: {
      addListener(callback: (notificationId: string) => void): void;
      removeListener(callback: (notificationId: string) => void): void;
    };

    export const onButtonClicked: {
      addListener(
        callback: (notificationId: string, buttonIndex: number) => void,
      ): void;
      removeListener(
        callback: (notificationId: string, buttonIndex: number) => void,
      ): void;
    };

    export const onClosed: {
      addListener(
        callback: (notificationId: string, byUser: boolean) => void,
      ): void;
      removeListener(
        callback: (notificationId: string, byUser: boolean) => void,
      ): void;
    };
  }

  export namespace runtime {
    export interface Port {
      name: string;
      disconnect(): void;
      postMessage(message: any): void;
      onDisconnect: {
        addListener(callback: (port: Port) => void): void;
        removeListener(callback: (port: Port) => void): void;
      };
      onMessage: {
        addListener(callback: (message: any, port: Port) => void): void;
        removeListener(callback: (message: any, port: Port) => void): void;
      };
    }

    export function connect(connectInfo?: { name?: string }): Port;
    export function getManifest(): chrome.runtime.Manifest;

    export const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response?: any) => void,
        ) => void | boolean,
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response?: any) => void,
        ) => void | boolean,
      ): void;
    };
  }

  interface Manifest {
    manifest_version: number;
    name: string;
    version: string;
    description?: string;
    permissions?: string[];
    host_permissions?: string[];
    background?: {
      service_worker: string;
      type?: "module";
    };
    action?: {
      default_popup?: string;
      default_icon?: { [size: string]: string };
      default_title?: string;
    };
    icons?: { [size: string]: string };
  }
}

// Para usar com async/await
declare namespace chrome.storage.local {
  function get<T = any>(keys?: string | string[] | null): Promise<T>;
  function set(items: { [key: string]: any }): Promise<void>;
}

declare namespace chrome.alarms {
  function clear(name: string): Promise<boolean>;
  function create(name: string, alarmInfo: chrome.alarms.AlarmCreateInfo): void;
}

declare namespace chrome.notifications {
  function create(
    notificationId: string,
    options: chrome.notifications.NotificationOptions,
  ): Promise<string>;
}
