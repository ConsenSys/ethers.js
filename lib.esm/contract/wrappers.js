import { Log, TransactionReceipt, TransactionResponse } from "../providers/index.js";
import { defineProperties, EventPayload } from "../utils/index.js";
export class EventLog extends Log {
    interface;
    fragment;
    args;
    constructor(log, iface, fragment) {
        super(log, log.provider);
        const args = iface.decodeEventLog(fragment, log.data, log.topics);
        defineProperties(this, { args, fragment, interface: iface });
    }
    get eventName() { return this.fragment.name; }
    get eventSignature() { return this.fragment.format(); }
}
export class ContractTransactionReceipt extends TransactionReceipt {
    #interface;
    constructor(iface, provider, tx) {
        super(tx, provider);
        this.#interface = iface;
    }
    get logs() {
        return super.logs.map((log) => {
            const fragment = log.topics.length ? this.#interface.getEvent(log.topics[0]) : null;
            if (fragment) {
                return new EventLog(log, this.#interface, fragment);
            }
            else {
                return log;
            }
        });
    }
}
export class ContractTransactionResponse extends TransactionResponse {
    #interface;
    constructor(iface, provider, tx) {
        super(tx, provider);
        this.#interface = iface;
    }
    async wait(confirms) {
        const receipt = await super.wait();
        if (receipt == null) {
            return null;
        }
        return new ContractTransactionReceipt(this.#interface, this.provider, receipt);
    }
}
export class ContractEventPayload extends EventPayload {
    fragment;
    log;
    args;
    constructor(contract, listener, filter, fragment, _log) {
        super(contract, listener, filter);
        const log = new EventLog(_log, contract.interface, fragment);
        const args = contract.interface.decodeEventLog(fragment, log.data, log.topics);
        defineProperties(this, { args, fragment, log });
    }
    get eventName() {
        return this.fragment.name;
    }
    get eventSignature() {
        return this.fragment.format();
    }
    async getBlock() {
        return await this.log.getBlock();
    }
    async getTransaction() {
        return await this.log.getTransaction();
    }
    async getTransactionReceipt() {
        return await this.log.getTransactionReceipt();
    }
}
//# sourceMappingURL=wrappers.js.map