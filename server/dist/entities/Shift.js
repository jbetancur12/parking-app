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
exports.Shift = void 0;
const core_1 = require("@mikro-orm/core");
const User_1 = require("./User");
let Shift = class Shift {
    constructor() {
        this.startTime = new Date();
        this.baseAmount = 0; // Base/Starting cash
        this.totalIncome = 0; // Calculated at close
        this.totalExpenses = 0; // Calculated at close
        this.cashIncome = 0;
        this.transferIncome = 0;
        this.declaredAmount = 0; // Cash physically counted
        // Status linked to whether endTime is set, but explicit status helps
        this.isActive = true;
    }
};
exports.Shift = Shift;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], Shift.prototype, "id", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Shift.prototype, "user", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], Shift.prototype, "startTime", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], Shift.prototype, "endTime", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Shift.prototype, "baseAmount", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Shift.prototype, "totalIncome", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Shift.prototype, "totalExpenses", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Shift.prototype, "cashIncome", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Shift.prototype, "transferIncome", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Shift.prototype, "declaredAmount", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], Shift.prototype, "notes", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Boolean)
], Shift.prototype, "isActive", void 0);
exports.Shift = Shift = __decorate([
    (0, core_1.Entity)()
], Shift);
