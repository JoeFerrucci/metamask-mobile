'use strict';
import TestHelpers from '../helpers';

import OnboardingView from '../pages/Onboarding/OnboardingView';
import OnboardingCarouselView from '../pages/Onboarding/OnboardingCarouselView';
import MetaMetricsOptIn from '../pages/Onboarding/MetaMetricsOptInView';
import ImportWalletView from '../pages/Onboarding/ImportWalletView';

import OnboardingWizardModal from '../pages/modals/OnboardingWizardModal';
import ConnectModal from '../pages/modals/ConnectModal';

import { Browser } from '../pages/Drawer/Browser';
import DrawerView from '../pages/Drawer/DrawerView';
import NetworkView from '../pages/Drawer/Settings/NetworksView';
import SettingsView from '../pages/Drawer/Settings/SettingsView';

import TransactionConfirmationView from '../pages/TransactionConfirmView';
import WalletView from '../pages/WalletView';

const SECRET_RECOVERY_PHRASE = 'fold media south add since false relax immense pause cloth just raven';
const PASSWORD = `12345678`;

const BINANCE_RPC_URL = 'https://bsc-dataseed1.binance.org';
const POLYGON_RPC_URL = 'https://polygon-rpc.com/';

const BINANCE_DEEPLINK_URL = 'https://metamask.app.link/send/0xB8B4EE5B1b693971eB60bDa15211570df2dB228A@56?value=1e14';

const POLYGON_DEEPLINK_URL =
	'https://metamask.app.link/send/0x0000000000000000000000000000000000001010@137/transfer?address=0xC5b2b5ae370876c0122910F92a13bef85A133E56&uint256=3e18';

const ETHEREUM_DEEPLINK_URL = 'https://metamask.app.link/send/0x1FDb169Ef12954F20A15852980e1F0C122BfC1D6@1?value=1e13';
const RINKEBY_DEEPLINK_URL = 'https://metamask.app.link/send/0x1FDb169Ef12954F20A15852980e1F0C122BfC1D6@4?value=1e13';

const DAPP_DEEPLINK_URL = 'https://metamask.app.link/dapp/app.uniswap.org';

describe('Deep linking Tests', () => {
	beforeEach(() => {
		jest.setTimeout(150000);
	});

	it('should import via seed phrase and validate in settings', async () => {
		await OnboardingCarouselView.isVisible();
		await OnboardingCarouselView.tapOnGetStartedButton();

		await OnboardingView.isVisible();
		await OnboardingView.tapImportWalletFromSeedPhrase();

		await MetaMetricsOptIn.isVisible();
		await MetaMetricsOptIn.tapAgreeButton();

		await ImportWalletView.isVisible();
	});

	it('should attempt to import wallet with invalid secret recovery phrase', async () => {
		await ImportWalletView.toggleRememberMe();
		await ImportWalletView.enterSecretRecoveryPhrase(SECRET_RECOVERY_PHRASE);
		await ImportWalletView.enterPassword(PASSWORD);
		await ImportWalletView.reEnterPassword(PASSWORD);
		await WalletView.isVisible();
		///
	});

	it('should dismiss the onboarding wizard', async () => {
		// dealing with flakiness on bitrise.
		await TestHelpers.delay(1000);
		try {
			await OnboardingWizardModal.isVisible();
			await OnboardingWizardModal.tapNoThanksButton();
			await OnboardingWizardModal.isNotVisible();
		} catch {
			//
		}
	});
	it('should deep link to the send flow with a custom network not added to wallet', async () => {
		const networkNotFoundText = 'Network not found';
		const networkErrorBodyMessage =
			'Network with chain id 56 not found in your wallet. Please add the network first.';

		await TestHelpers.openDeepLink(BINANCE_DEEPLINK_URL);
		await TestHelpers.delay(3000);
		await TestHelpers.checkIfElementWithTextIsVisible(networkNotFoundText);
		await TestHelpers.checkIfElementWithTextIsVisible(networkErrorBodyMessage);

		await WalletView.tapOKAlertButton();
	});

	it('should go to settings then networks', async () => {
		// Open Drawer
		await WalletView.tapDrawerButton(); // tapping burger menu

		await DrawerView.isVisible();
		await DrawerView.tapSettings();

		await SettingsView.tapNetworks();

		await NetworkView.isNetworkViewVisible();
	});

	it('should add BSC network', async () => {
		// Tap on Add Network button
		await TestHelpers.delay(3000);
		await NetworkView.tapAddNetworkButton();

		await NetworkView.isRpcViewVisible();
		await NetworkView.typeInNetworkName('Binance Smart Chain Mainnet');
		await NetworkView.typeInRpcUrl(BINANCE_RPC_URL);
		await NetworkView.typeInChainId('56');
		await NetworkView.typeInNetworkSymbol('BNB\n');

		await NetworkView.swipeToRPCTitleAndDismissKeyboard(); // Focus outside of text input field
		await NetworkView.tapRpcNetworkAddButton();

		await WalletView.isVisible();
		await WalletView.isNetworkNameVisible('Binance Smart Chain Mainnet');
		await WalletView.tapDrawerButton(); // tapping burger menu
	});

	it('should return to settings then networks', async () => {
		// Open Drawer
		await DrawerView.isVisible();
		await DrawerView.tapSettings();

		await SettingsView.tapNetworks();

		await NetworkView.isNetworkViewVisible();
	});

	it('should add polygon network', async () => {
		// Tap on Add Network button
		await TestHelpers.delay(3000);
		await NetworkView.tapAddNetworkButton();

		await NetworkView.isRpcViewVisible();
		await NetworkView.typeInNetworkName('Polygon Mainnet');
		await NetworkView.typeInRpcUrl(POLYGON_RPC_URL);
		await NetworkView.typeInChainId('137');
		await NetworkView.typeInNetworkSymbol('MATIC\n');

		await NetworkView.swipeToRPCTitleAndDismissKeyboard(); // Focus outside of text input field
		await NetworkView.tapRpcNetworkAddButton();

		await WalletView.isVisible();
		await WalletView.isNetworkNameVisible('Polygon Mainnet');
	});

	it('should deep link to the send flow on matic', async () => {
		await TestHelpers.openDeepLink(POLYGON_DEEPLINK_URL);

		await TestHelpers.delay(4500);
		await TransactionConfirmationView.isVisible();
		await TransactionConfirmationView.isNetworkNameVisible('Polygon Mainnet');
		await TestHelpers.delay(1500);
		await TransactionConfirmationView.tapCancelButton();
	});
	it('should deep link to the send flow on BSC', async () => {
		await TestHelpers.openDeepLink(BINANCE_DEEPLINK_URL);
		await TestHelpers.delay(4500);
		await TransactionConfirmationView.isVisible();
		await TransactionConfirmationView.isNetworkNameVisible('Binance Smart Chain Mainnet');
	});

	it('should deep link to the send flow on Rinkeby and submit the transaction', async () => {
		await TestHelpers.openDeepLink(RINKEBY_DEEPLINK_URL);
		await TestHelpers.delay(4500);
		await TransactionConfirmationView.isVisible();
		await TransactionConfirmationView.isNetworkNameVisible('Rinkeby Test Network');
		await TransactionConfirmationView.isTransactionTotalCorrect('0.00001 ETH');
		// Tap on the Send CTA
		await TransactionConfirmationView.tapConfirmButton();
		// Check that we are on the wallet screen
		await WalletView.isVisible();
	});

	it('should deep link to the send flow on mainnet', async () => {
		await TestHelpers.openDeepLink(ETHEREUM_DEEPLINK_URL);
		await TestHelpers.delay(4500);

		await TransactionConfirmationView.isVisible();
		await TransactionConfirmationView.isNetworkNameVisible('Ethereum Main Network');
	});

	it('should deep link to a dapp (Uniswap)', async () => {
		await TestHelpers.openDeepLink(DAPP_DEEPLINK_URL);
		await TestHelpers.delay(4500);

		await ConnectModal.isVisible();
		await ConnectModal.tapConnectButton();

		await TestHelpers.checkIfElementWithTextIsVisible('app.uniswap.org', 0);

		await Browser.isVisible();
		await ConnectModal.isNotVisible();
	});
});
