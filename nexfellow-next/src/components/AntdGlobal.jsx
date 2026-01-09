"use client";

import { App } from "antd";

let message = null;
let notification = null;
let modal = null;

export default function AntdGlobal() {
    const staticFunction = App.useApp();
    message = staticFunction.message;
    notification = staticFunction.notification;
    modal = staticFunction.modal;
    return null;
}

export const getMessage = () => message;
export const getNotification = () => notification;
export const getModal = () => modal;
