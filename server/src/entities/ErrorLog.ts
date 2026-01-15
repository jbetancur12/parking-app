import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Tenant } from './Tenant';
import { User } from './User';

@Entity()
export class ErrorLog {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    // Optional tenant - may be null if error occurs before login
    @ManyToOne(() => Tenant, { nullable: true })
    tenant?: Tenant;

    // Optional user - may be null if error occurs before login
    @ManyToOne(() => User, { nullable: true })
    user?: User;

    @Property({ type: 'text' })
    errorMessage: string;

    @Property({ type: 'text', nullable: true })
    errorStack?: string;

    @Property({ type: 'text', nullable: true })
    componentStack?: string;

    @Property({ type: 'text', nullable: true })
    userAgent?: string;

    @Property({ type: 'text', nullable: true })
    url?: string;

    @Property()
    timestamp: Date = new Date();

    @Property({ default: false })
    resolved: boolean = false;

    @Property({ nullable: true })
    resolvedBy?: string; // Username who resolved it

    @Property({ nullable: true })
    resolvedAt?: Date;

    constructor(data: {
        errorMessage: string;
        errorStack?: string;
        componentStack?: string;
        userAgent?: string;
        url?: string;
        tenant?: Tenant;
        user?: User;
    }) {
        this.errorMessage = data.errorMessage;
        this.errorStack = data.errorStack;
        this.componentStack = data.componentStack;
        this.userAgent = data.userAgent;
        this.url = data.url;
        this.tenant = data.tenant;
        this.user = data.user;
    }
}
