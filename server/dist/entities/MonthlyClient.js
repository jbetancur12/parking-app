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
exports.MonthlyClient = void 0;
const core_1 = require("@mikro-orm/core");
let MonthlyClient = class MonthlyClient {
    constructor() {
        this.isActive = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.MonthlyClient = MonthlyClient;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], MonthlyClient.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], MonthlyClient.prototype, "plate", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], MonthlyClient.prototype, "name", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], MonthlyClient.prototype, "phone", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], MonthlyClient.prototype, "vehicleType", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], MonthlyClient.prototype, "startDate", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], MonthlyClient.prototype, "endDate", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MonthlyClient.prototype, "monthlyRate", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Boolean)
], MonthlyClient.prototype, "isActive", void 0);
__decorate([
    (0, core_1.Property)({ onCreate: () => new Date() }),
    __metadata("design:type", Date)
], MonthlyClient.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], MonthlyClient.prototype, "updatedAt", void 0);
exports.MonthlyClient = MonthlyClient = __decorate([
    (0, core_1.Entity)()
], MonthlyClient);
