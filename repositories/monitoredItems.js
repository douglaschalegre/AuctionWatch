import { MonitoredItem } from '../domain/models/MonitoredItem.js';

export async function findMonitoredItems(){
    return await MonitoredItem.findAll();
}