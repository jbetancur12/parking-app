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
exports.ParkingSession = exports.PlanType = exports.ParkingStatus = exports.VehicleType = void 0;
const core_1 = require("@mikro-orm/core");
const Shift_1 = require("./Shift");
var VehicleType;
(function (VehicleType) {
    VehicleType["CAR"] = "CAR";
    VehicleType["MOTORCYCLE"] = "MOTORCYCLE";
    VehicleType["OTHER"] = "OTHER";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var ParkingStatus;
(function (ParkingStatus) {
    ParkingStatus["ACTIVE"] = "ACTIVE";
    ParkingStatus["COMPLETED"] = "COMPLETED";
    ParkingStatus["CANCELLED"] = "CANCELLED";
})(ParkingStatus || (exports.ParkingStatus = ParkingStatus = {}));
var PlanType;
(function (PlanType) {
    PlanType["HOUR"] = "HOUR";
    PlanType["DAY"] = "DAY";
})(PlanType || (exports.PlanType = PlanType = {}));
let ParkingSession = class ParkingSession {
    constructor() {
        this.planType = PlanType.HOUR; // Default to HOUR
        this.entryTime = new Date();
        this.status = ParkingStatus.ACTIVE;
    }
};
exports.ParkingSession = ParkingSession;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], ParkingSession.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], ParkingSession.prototype, "plate", void 0);
__decorate([
    (0, core_1.Enum)(() => VehicleType),
    __metadata("design:type", String)
], ParkingSession.prototype, "vehicleType", void 0);
__decorate([
    (0, core_1.Enum)(() => PlanType),
    __metadata("design:type", String)
], ParkingSession.prototype, "planType", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], ParkingSession.prototype, "entryTime", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], ParkingSession.prototype, "exitTime", void 0);
__decorate([
    (0, core_1.Property)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ParkingSession.prototype, "cost", void 0);
__decorate([
    (0, core_1.Enum)(() => ParkingStatus),
    __metadata("design:type", String)
], ParkingSession.prototype, "status", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Shift_1.Shift),
    __metadata("design:type", Shift_1.Shift)
], ParkingSession.prototype, "entryShift", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Shift_1.Shift, { nullable: true }),
    __metadata("design:type", Shift_1.Shift)
], ParkingSession.prototype, "exitShift", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], ParkingSession.prototype, "notes", void 0);
exports.ParkingSession = ParkingSession = __decorate([
    (0, core_1.Entity)()
], ParkingSession);
