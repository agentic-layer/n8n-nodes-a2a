import {
	NodeConnectionTypes,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

export class A2a implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'A2A',
		name: 'a2a',
		icon: 'file:../../icons/a2a.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '=Send Message',
		description: 'Send messages to AI agents via the A2A protocol',
		defaults: {
			name: 'A2A',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'a2aApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				required: true,
				description: 'The text message to send to the A2A agent',
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Context ID',
				name: 'contextId',
				type: 'string',
				default: '',
				description: 'Optional context ID to maintain conversation threading across multiple messages',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const message = this.getNodeParameter('message', i) as string;
				const contextId = this.getNodeParameter('contextId', i, '') as string;
				const credentials = await this.getCredentials('a2aApi');

				const serverUrl = credentials.serverUrl as string;

				// Generate unique request ID
				const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

				// Build JSON-RPC 2.0 request payload
				const requestBody: {
					jsonrpc: string;
					method: string;
					params: {
						message: {
							role: string;
							parts: Array<{ type: string; text: string }>;
						};
						contextId?: string;
					};
					id: string;
				} = {
					jsonrpc: '2.0',
					method: 'message/send',
					params: {
						message: {
							role: 'user',
							parts: [
								{
									type: 'text',
									text: message,
								},
							],
						},
					},
					id: requestId,
				};

				// Add contextId if provided
				if (contextId) {
					requestBody.params.contextId = contextId;
				}

				// Make HTTP request
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${serverUrl}`,
					headers: {
						'Content-Type': 'application/json',
					},
					body: requestBody,
					json: true,
				});

				// Return the full task object from the result field
				returnData.push({
					json: response.result || response,
					pairedItem: i,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
