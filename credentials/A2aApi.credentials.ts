import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class A2aApi implements ICredentialType {
	name = 'a2aApi';

	displayName = 'A2A API';

	icon: Icon = 'file:../icons/a2a.svg';

	documentationUrl = 'https://a2a-protocol.org';

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: '',
			placeholder: 'https://agent-gateway.agentic-layer.ai/my-agent',
			description: 'The base URL of the A2A server endpoint',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			url: '/.well-known/agent-card.json',
			method: 'GET',
		},
	};
}
