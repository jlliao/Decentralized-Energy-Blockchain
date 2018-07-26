export interface Resident {
    id: string;
    name: string;
    token: number;
    coins: number;
}

export interface UpdateResident {
    name: string;
    token: number;
    coins: number;
}

export interface Transaction {
    consumer: string;
    producer: string;
    transaction: number;    
}

export interface AuthData {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

