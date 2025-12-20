"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TransactionType = void 0;
const core_1 = require("@mikro-orm/core");
const Shift_1 = require("./Shift");
var TransactionType;
(function (TransactionType) {
    TransactionType["INCOME"] = "INCOME";
    TransactionType["EXPENSE"] = "EXPENSE";
    TransactionType["PARKING_REVENUE"] = "PARKING_REVENUE";
    TransactionType["MONTHLY_PAYMENT"] = "MONTHLY_PAYMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let Transaction = class Transaction {
    constructor() {
        this.timestamp = new Date();
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Shift_1.Shift),
    __metadata("design:type", Shift_1.Shift)
], Transaction.prototype, "shift", void 0);
__decorate([
    (0, core_1.Enum)(() => TransactionType),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, core_1.Property)({ onCreate: () => new Date() }),
    __metadata("design:type", Date)
], Transaction.prototype, "timestamp", void 0);
exports.Transaction = Transaction = __decorate([
    (0, core_1.Entity)()
], Transaction);
