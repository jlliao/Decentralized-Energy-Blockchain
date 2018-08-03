//response.ts - contain all data types of responses

export interface Account {
    id: string;
    name: string;
    token: number;
    coins: number;
}

export interface UpdateAccount {
    name: string;
    token: number;
    coins: number;
}

export interface Transaction {
    timestamp: string;
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

