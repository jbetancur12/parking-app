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
exports.Tariff = exports.TariffType = exports.VehicleType = void 0;
const core_1 = require("@mikro-orm/core");
var VehicleType;
(function (VehicleType) {
    VehicleType["CAR"] = "CAR";
    VehicleType["MOTORCYCLE"] = "MOTORCYCLE";
    VehicleType["OTHER"] = "OTHER";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var TariffType;
(function (TariffType) {
    TariffType["MINUTE"] = "MINUTE";
    TariffType["HOUR"] = "HOUR";
    TariffType["DAY"] = "DAY";
    TariffType["NIGHT"] = "NIGHT";
    TariffType["MONTH"] = "MONTH";
})(TariffType || (exports.TariffType = TariffType = {}));
let Tariff = class Tariff {
};
exports.Tariff = Tariff;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], Tariff.prototype, "id", void 0);
__decorate([
    (0, core_1.Enum)(() => VehicleType),
    __metadata("design:type", String)
], Tariff.prototype, "vehicleType", void 0);
__decorate([
    (0, core_1.Enum)(() => TariffType),
    __metadata("design:type", String)
], Tariff.prototype, "tariffType", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Tariff.prototype, "cost", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], Tariff.prototype, "description", void 0);
exports.Tariff = Tariff = __decorate([
    (0, core_1.Entity)()
], Tariff);
