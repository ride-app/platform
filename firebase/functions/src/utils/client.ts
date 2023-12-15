// import { loadPackageDefinition } from '@grpc/grpc-js';
// import { loadSync } from '@grpc/proto-loader';
// import { ProtoGrpcType } from './generated/wallet_service';

// // Suggested options for similarity to existing grpc.load behavior
// const packageDefinition = loadSync(
// 	`${__dirname}/../protos/wallet_service.proto`,
// 	{
// 		// keepCase: true,
// 		longs: Number,
// 		enums: String,
// 		defaults: true,
// 		oneofs: true,
// 	}
// );
// const protoDescriptor = loadPackageDefinition(
// 	packageDefinition
// ) as unknown as ProtoGrpcType;

// // The protoDescriptor object has the full package hierarchy
// const { ride } = protoDescriptor;

// export default ride.wallet.v1.WalletService;
