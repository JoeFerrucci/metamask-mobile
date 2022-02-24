import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity, View, TextInput } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import ActionSheet from 'react-native-actionsheet';
import CustomText from '../../../../components/Base/Text';
import AssetIcon from '../../../../components/UI/AssetIcon';
import { colors, fontStyles } from '../../../../styles/common';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { strings } from '../../../../../locales/i18n';
import Networks, { getAllNetworks } from '../../../../util/networks';
import StyledButton from '../../../UI/StyledButton';
import PopularList from '../../../../util/networks/customNetworks';
import Engine from '../../../../core/Engine';
import { MAINNET, RPC } from '../../../../constants/network';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 24,
		marginBottom: 24,
	},
	networkIcon: {
		width: 20,
		height: 20,
		borderRadius: 10,
		marginTop: 2,
		marginRight: 16,
	},
	text: {
		textAlign: 'center',
		color: colors.white100,
		fontSize: 10,
		marginTop: 4,
	},
	network: {
		flex: 1,
		flexDirection: 'row',
		paddingVertical: 12,
		alignItems: 'center',
	},
	networkWrapper: {
		flex: 0,
		flexDirection: 'row',
	},
	networkLabel: {
		fontSize: 16,
		color: colors.fontPrimary,
		...fontStyles.normal,
	},
	sectionLabel: {
		fontSize: 14,
		paddingVertical: 12,
		color: colors.fontPrimary,
		...fontStyles.bold,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: colors.grey100,
	},
	input: {
		flex: 1,
		fontSize: 14,
		color: colors.black,
		...fontStyles.normal,
		paddingLeft: 10,
	},
	icon: {
		marginLeft: 8,
	},
	no_match_text: {
		marginVertical: 10,
	},
});

/**
 * Main view for app configurations
 */
class NetworksSettings extends PureComponent {
	static propTypes = {
		/**
		 * A list of custom RPCs to provide the user
		 */
		frequentRpcList: PropTypes.array,
		/**
		 * Object that represents the navigator
		 */
		navigation: PropTypes.object,
		/**
		 * NetworkController povider object
		 */
		provider: PropTypes.object,
		/**
		 * Indicates whether third party API mode is enabled
		 */
		thirdPartyApiMode: PropTypes.bool,
	};

	actionSheet = null;
	networkToRemove = null;

	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('app_settings.networks_title'), navigation);

	state = {
		searchString: '',
		filteredNetworks: [],
	};

	getOtherNetworks = () => getAllNetworks().slice(1);

	onNetworkPress = (network) => {
		const { navigation } = this.props;
		navigation.navigate('NetworkSettings', { network });
	};

	onAddNetwork = () => {
		const { navigation } = this.props;
		navigation.navigate('NetworkSettings');
	};

	showRemoveMenu = (network) => {
		this.networkToRemove = network;
		this.actionSheet.show();
	};

	switchToMainnet = () => {
		const { NetworkController, CurrencyRateController } = Engine.context;
		CurrencyRateController.setNativeCurrency('ETH');
		NetworkController.setProviderType(MAINNET);
		this.props.thirdPartyApiMode &&
			setTimeout(() => {
				Engine.refreshTransactionHistory();
			}, 1000);
	};

	removeNetwork = () => {
		// Check if it's the selected network and then switch to mainnet first
		const { provider } = this.props;
		if (provider.rpcTarget === this.networkToRemove && provider.type === RPC) {
			this.switchToMainnet();
		}
		const { PreferencesController } = Engine.context;
		PreferencesController.removeFromFrequentRpcList(this.networkToRemove);
	};

	createActionSheetRef = (ref) => {
		this.actionSheet = ref;
	};

	onActionSheetPress = (index) => (index === 0 ? this.removeNetwork() : null);

	networkElement(name, image, i, network, isCustomRPC) {
		return (
			<View key={`network-${network}`}>
				{network === MAINNET ? (
					this.renderMainnet()
				) : (
					<TouchableOpacity
						key={`network-${i}`}
						onPress={() => this.onNetworkPress(network)} // eslint-disable-line
						onLongPress={() => isCustomRPC && this.showRemoveMenu(network)} // eslint-disable-line
						testID={'select-network'}
					>
						<View style={styles.network}>
							{isCustomRPC && <AssetIcon logo={image} customStyle={styles.networkIcon} />}
							{!isCustomRPC && (
								<View style={[styles.networkIcon, { backgroundColor: image }]}>
									<Text style={styles.text}>{name[0]}</Text>
								</View>
							)}
							<Text style={styles.networkLabel}>{name}</Text>
							{!isCustomRPC && (
								<FontAwesome name="lock" size={20} color={colors.grey100} style={styles.icon} />
							)}
						</View>
					</TouchableOpacity>
				)}
			</View>
		);
	}

	renderOtherNetworks() {
		return this.getOtherNetworks().map((network, i) => {
			const { color, name } = Networks[network];
			return this.networkElement(name, color, i, network, false);
		});
	}

	showImage = (chainId) => {
		const customNetworkData = PopularList.filter((x) => x.chainId === chainId);
		const image = customNetworkData.length > 0 ? customNetworkData[0].rpcPrefs.imageUrl : null;
		return image;
	};

	renderRpcNetworks = () => {
		const { frequentRpcList } = this.props;
		return frequentRpcList.map(({ rpcUrl, nickname, chainId }, i) => {
			const { name } = { name: nickname || rpcUrl };
			const image = this.showImage(chainId);
			return this.networkElement(name, image, i, rpcUrl, true);
		});
	};

	renderRpcNetworksView = () => {
		const { frequentRpcList } = this.props;
		if (frequentRpcList.length > 0) {
			return (
				<View testID={'rpc-networks'}>
					<Text style={styles.sectionLabel}>{strings('app_settings.custom_network_name')}</Text>
					{this.renderRpcNetworks()}
				</View>
			);
		}
	};

	renderMainnet() {
		const { name: mainnetName } = Networks.mainnet;
		return (
			<View style={styles.mainnetHeader}>
				<TouchableOpacity
					style={styles.network}
					key={`network-${MAINNET}`}
					onPress={() => this.onNetworkPress(MAINNET)} // eslint-disable-line
				>
					<View style={styles.networkWrapper}>
						<AssetIcon logo={'eth.svg'} customStyle={styles.networkIcon} />
						<View style={styles.networkInfo}>
							<Text style={styles.networkLabel}>{mainnetName}</Text>
						</View>
					</View>
					<FontAwesome name="lock" size={20} color={colors.grey100} style={styles.icon} />
				</TouchableOpacity>
			</View>
		);
	}

	handleSearchTextChange = (text) => {
		this.setState({ searchString: text });
		const defaultNetwork = getAllNetworks().map((network, i) => {
			const { color, name } = Networks[network];
			return { name, color, network, isCustomRPC: false };
		});
		const customRPC = this.props.frequentRpcList.map((network, i) => {
			const { color, name, url, chainId } = {
				name: network.nickname || network.rpcUrl,
				url: network.rpcUrl,
				color: null,
				chainId: network.chainId,
			};
			return { name, color, i, network: url, isCustomRPC: true, chainId };
		});

		const allActiveNetworks = defaultNetwork.concat(customRPC);
		const searchResult = allActiveNetworks.filter(({ name }) => name.toLowerCase().includes(text.toLowerCase()));
		this.setState({ filteredNetworks: searchResult });
	};

	clearSearchInput = () => this.setState({ searchString: '', filteredNetworks: [] });

	filteredResult = () => {
		if (this.state.filteredNetworks.length > 0) {
			return this.state.filteredNetworks.map((data, i) => {
				const { network, chainId, name, color, isCustomRPC } = data;
				const image = this.showImage(chainId);
				return this.networkElement(name, image || color, i, network, isCustomRPC);
			});
		}
		return <CustomText style={styles.no_match_text}>{strings('networks.no_match')}</CustomText>;
	};

	render() {
		return (
			<View style={styles.wrapper} testID={'networks-screen'}>
				<View style={styles.inputWrapper}>
					<Icon name="ios-search" size={20} color={colors.grey100} />
					<TextInput
						style={styles.input}
						placeholder={strings('networks.search')}
						placeholderTextColor={colors.grey500}
						value={this.state.searchString}
						onChangeText={this.handleSearchTextChange}
					/>
					{this.state.searchString.length > 0 && (
						<Icon name="ios-close" size={20} color={colors.grey300} onPress={this.clearSearchInput} />
					)}
				</View>
				<ScrollView style={styles.networksWrapper}>
					{this.state.searchString.length > 0 ? (
						this.filteredResult()
					) : (
						<>
							<Text style={styles.sectionLabel}>{strings('app_settings.mainnet')}</Text>
							{this.renderMainnet()}
							{this.renderRpcNetworksView()}
							<Text style={styles.sectionLabel}>{strings('app_settings.test_network_name')}</Text>
							{this.renderOtherNetworks()}
						</>
					)}
				</ScrollView>
				<StyledButton
					type="confirm"
					onPress={this.onAddNetwork}
					containerStyle={styles.syncConfirm}
					testID={'add-network-button'}
				>
					{strings('app_settings.network_add_network')}
				</StyledButton>
				<ActionSheet
					ref={this.createActionSheetRef}
					title={strings('app_settings.remove_network_title')}
					options={[strings('app_settings.remove_network'), strings('app_settings.cancel_remove_network')]}
					cancelButtonIndex={1}
					destructiveButtonIndex={0}
					onPress={this.onActionSheetPress}
				/>
			</View>
		);
	}
}

const mapStateToProps = (state) => ({
	provider: state.engine.backgroundState.NetworkController.provider,
	frequentRpcList: state.engine.backgroundState.PreferencesController.frequentRpcList,
	thirdPartyApiMode: state.privacy.thirdPartyApiMode,
});

export default connect(mapStateToProps)(NetworksSettings);
