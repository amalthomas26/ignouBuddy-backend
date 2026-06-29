//the result of successfult login verification
export interface AuthResult {
  readonly expiresAt: Date;
  readonly student: {
    readonly id: string;
    readonly enrollmentNumber: string;
    readonly name: string;
    readonly email: string | null;
    readonly isVerified: boolean;
  };
}

//metadata extracted from the incoming request

export interface RequestMetadata {
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly deviceInfo?: string;
}
