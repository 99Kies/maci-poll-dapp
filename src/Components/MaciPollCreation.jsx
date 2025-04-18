import { setToast } from '../Store/Slides/StoreSlides';
import { useDispatch } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import Select from './Select';
import { MaciCircuitType, MaciClient } from '@dorafactory/maci-sdk';
import { GasPrice, calculateFee } from '@cosmjs/stargate';
import LoadingDots from './LoadingDots';
import axios from 'axios';
import { makeReadableNumber, getKeplrSigner } from '../Helpers/Helpers';

export default function MaciPollCreation({ sendContext }) {
	const [pollAddr, setPollAddr] = useState('');
	const dispatch = useDispatch();

	const copyKey = (keyType, key) => {
		navigator.clipboard.writeText(key);
		dispatch(
			setToast({
				type: 1,
				desc: `${keyType} 👏`,
			})
		);
	};

	const handlePollAdd = data => {
		setPollAddr(data);
		sendContext(
			`https://vota${
				process.env.REACT_APP_NETWORK === 'testnet' ? '-test' : ''
			}.dorafactory.org/round/${data}`
		);
	};

	return (
		<div className="fit-container fx-centered">
			<div className="main-middle">
				<div className="fit-container fx-centered fx-col fx-start-h box-pad-v">
					{!pollAddr && (
						<OracleMACIPoll setPollAddr={handlePollAdd} />
					)}
					{pollAddr && (
						<>
							<div className="fit-container sc-s-18 bg-sp box-pad-h box-pad-v fx-centered fx-col slide-down">
								<div
									className="checkmark-24"
									style={{
										minWidth: '48px',
										minHeight: '48px',
									}}
								></div>
								<h4>Deployment succeeded</h4>
								<p className="gray-c p-centered box-pad-h">
									You have successfully deployed your MACI
									poll, you can now share it on Yakihonne!
								</p>
								<button
									onClick={() => setPollAddr('')}
									className="btn btn-normal"
								>
									Create new round
								</button>
							</div>
							<div
								className={
									'fx-scattered if pointer fit-container dashed-onH slide-up box-pad-v-m'
								}
								style={{
									borderStyle: 'dashed',
									height: 'auto',
								}}
								onClick={() =>
									copyKey(
										'Link was copied!',
										`https://vota${
											process.env.REACT_APP_NETWORK ===
											'testnet'
												? '-test'
												: ''
										}.dorafactory.org/round/${pollAddr}`
									)
								}
							>
								<p>{`https://vota.dorafactory.org/round/${pollAddr}`}</p>
								<div className="copy-24"></div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

const OracleMACIPoll = ({ setPollAddr, exit }) => {
	const [circuitType, setCircuitType] = useState('0');
	const [ecosystemType, setEcosystemType] = useState('doravota');
	const [roundName, setRoundName] = useState('');
	const [roundDescription, setRoundDescription] = useState('');
	const [votersNumber, setVotersNumber] = useState('');
	const [optionsNumber, setOptionsNumber] = useState('');
	const [voteStart, setVoteStart] = useState('');
	const [voteEnd, setVoteEnd] = useState('');
	const [options, setOptions] = useState([]);
	const [tempOption, setTempOption] = useState('');
	const [snapshotHeight, setSnapshotHeight] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showConfirmationBox, setShowConfirmationBox] = useState(false);
	const [circuitEM, setCircuitEM] = useState(false);
	const [ecosystemEM, setEcosystemEM] = useState(false);
	const [roundNameEM, setRoundNameEM] = useState(false);
	const [roundDescriptionEM, setRoundDescriptionEM] = useState(false);
	const [gasFee, setGasFee] = useState('');
	const [snapshotHeightEM, setSnapshotHeightEM] = useState(false);
	const [voteStartEM, setVoteStartEM] = useState(false);
	const [voteEndEM, setVoteEndEM] = useState(false);
	const [optionsEM, setOptionsEM] = useState(false);
	const [ecosystemsInfo, setEcosystemsInfo] = useState(false);
	const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
	const snapshotHeightInfo = useMemo(() => {
		if (ecosystemType && ecosystemsInfo) {
			return (
				ecosystemsInfo.find(_ => _.name === ecosystemType)
					?.snapshotHeightInfo || { lowestHeight: 0, latestHeight: 0 }
			);
		} else return { lowestHeight: 0, latestHeight: 0 };
	}, [ecosystemType, ecosystemsInfo]);

	const circuitTypes = [
		{
			display_name: 'MACI-1p1v',
			value: MaciCircuitType.IP1V,
		},
		{
			display_name: 'MACI-QV',
			value: MaciCircuitType.QV,
		},
	];
	const ecosystemTypes = [
		{
			display_name: 'Cosmos Hub',
			value: 'cosmoshub',
		},
		{
			display_name: 'Dora Vota',
			value: 'doravota',
		},
	];

	useEffect(() => {
		const fetchEcosystemInfo = async () => {
			try {
				let data = await axios.get(
					'https://vota-certificate-api.dorafactory.org/api/v1/list'
				);
				if (data) setEcosystemsInfo(data?.data?.ecosystems);
			} catch (err) {
				console.log(err);
			}
		};
		fetchEcosystemInfo();
	}, []);

	const handleAddOption = () => {
		if (
			!tempOption &&
			!(optionsNumber > 0 && options.length + 1 <= optionsNumber)
		)
			return;
		setOptions(prev => [...prev, tempOption]);
		setOptionsEM(false);
		setTempOption('');
	};
	const handleEditOption = (value, index) => {
		if (!value) {
			handleDeleteOption(index);
			return;
		}
		let tempArray = Array.from(options);
		tempArray[index] = value;
		setOptions(tempArray);
	};
	const handleDeleteOption = index => {
		let tempArray = Array.from(options);
		tempArray.splice(index, 1);
		setOptions(tempArray);
	};

	const handleConfirmationBox = () => {
		setOptions([]);
		setOptionsNumber('');
		setTempOption('');
		setShowConfirmationBox(false);
	};
	const deployPoll = async () => {
		try {
			if (isLoading) return;
			let isInputValid = checkInputs();
			if (!isInputValid) return;
			setIsLoading(true);
			const client = new MaciClient({
				network: process.env.REACT_APP_NETWORK,
			});

			let { signer } = await getKeplrSigner();
			let poll = await client.createOracleMaciRound({
				signer: signer,
				operatorPubkey: process.env.REACT_APP_OP_PUBKEY,
				startVoting: new Date(voteStart),
				endVoting: new Date(voteEnd),
				title: roundName,
				description: roundDescription,
				circuitType,
				link: '',
				whitelistEcosystem: ecosystemType,
				whitelistSnapshotHeight: snapshotHeight || '0',
				whitelistVotingPowerArgs: {
					mode: 'threshold',
					slope:
						ecosystemType === 'cosmoshub'
							? '10000000'
							: '10000000000000000000',
					threshold:
						ecosystemType === 'cosmoshub'
							? '10000000'
							: '10000000000000000000',
				},
				voteOptionMap: [...options, tempOption].filter(_ => _),
			});

			setGasFee({ signer, pollID: poll.contractAddress });
			setIsLoading(false);
		} catch (err) {
			console.log(err);
			setIsLoading(false);
		}
	};
	const checkInputs = () => {
		let isValid = true;
		if (!circuitType) {
			setCircuitEM(true);
			isValid = false;
		}
		if (!ecosystemType) {
			setEcosystemEM(true);
			isValid = false;
		}
		if (!roundName) {
			setRoundNameEM(true);
			isValid = false;
		}
		if (!roundName) {
			setRoundDescriptionEM(true);
			isValid = false;
		}
		if (options.length < 2 && !tempOption) {
			setOptionsEM(true);
			isValid = false;
		}
		if (
			!voteStart ||
			new Date(voteStart).getTime() <= new Date().getTime()
		) {
			setVoteStartEM(true);
			isValid = false;
		}
		if (
			!voteEnd ||
			new Date(voteEnd).getTime() < new Date(voteStart).getTime()
		) {
			setVoteEndEM(true);
			isValid = false;
		}

		return isValid;
	};

	const handleSnapshotHeight = e => {
		let value = parseInt(e.target.value) || '';
		setSnapshotHeightEM(false);
		setSnapshotHeight(value.toString());
		if (!value) return;
		if (
			!(
				value >= parseInt(snapshotHeightInfo.lowestHeight) &&
				value <= parseInt(snapshotHeightInfo.latestHeight)
			)
		)
			setSnapshotHeightEM(true);
	};

	return (
		<>
			{gasFee && (
				<PollGasStation
					poll={gasFee.pollID}
					signer={gasFee.signer}
					exit={() => setPollAddr(gasFee.pollID)}
				/>
			)}
			{showConfirmationBox && (
				<ComfirmationBox
					exit={() => setShowConfirmationBox(false)}
					handleClick={handleConfirmationBox}
				/>
			)}
			{!gasFee && (
				<div
					className="fit-container sc-s-18 bg-sp "
					style={{ border: 'none' }}
				>
					<div
						className="fx-centered fx-col fx-start-h fx-start-v fit-container slide-down"
						style={{ position: 'relative' }}
					>
						{exit && (
							<div className="close" onClick={exit}>
								<div></div>
							</div>
						)}
						<div className="fit-container fx-centered box-marg-s fx-col">
							<h4>Configure your MACI round</h4>
							<div className="fx-centered">
								<p className="gray-c">One-person, One vote</p>
								{/* <MACIPollSteps /> */}
							</div>
						</div>
						<div className="fit-container sc-s-18 box-pad-v-s box-pad-h-m">
							<p className="c1-c">Tips</p>
							<ul>
								<li>
									Fund the round with gas fees (8 DORA per
									voter) to cover signup and voting.
								</li>
								<li>
									Each signup consumes 6 DORA, each vote
									consumes 2 DORA
								</li>
								<li>
									Choose an option to vote or resubmit your
									vote.
								</li>
								<li>
									Each revote consumes an additional of 2 DORA
								</li>
							</ul>
						</div>
						<input
							type="text"
							placeholder={'Name'}
							className="if ifs-full"
							value={roundName}
							onChange={e => {
								setRoundNameEM(false);
								setRoundName(e.target.value);
							}}
						/>
						{roundNameEM && (
							<ErrorMessage
								message={'A round name is required'}
							/>
						)}
						<textarea
							placeholder={'Description'}
							className="txt-area ifs-full"
							value={roundDescription}
							onChange={e => {
								setRoundDescriptionEM(false);
								setRoundDescription(e.target.value);
							}}
						/>
						{roundDescriptionEM && (
							<ErrorMessage
								message={'A round description name is required'}
							/>
						)}
						<p className="gray-c">{'Sart time'}</p>
						<input
							type="datetime-local"
							className="if ifs-full pointer"
							placeholder={'Poll close date'}
							min={new Date().toISOString()}
							value={voteStart}
							onChange={e => {
								setVoteStartEM(false);
								setVoteStart(e.target.value);
							}}
						/>
						{voteStartEM && (
							<ErrorMessage
								message={
									'The start time must be greater than the current time'
								}
							/>
						)}
						<p className="gray-c">{'End time'}</p>
						<input
							type="datetime-local"
							className="if ifs-full pointer"
							placeholder={'Poll close date'}
							min={new Date().toISOString()}
							value={voteEnd}
							onChange={e => {
								setVoteEndEM(false);
								setVoteEnd(e.target.value);
							}}
						/>
						{voteEndEM && (
							<ErrorMessage
								message={
									'The end time must be greater than the start time'
								}
							/>
						)}
						<p className="gray-c">{'Options'}</p>
						{!optionsNumber && <p>-</p>}
						<div className="fit-container fx-centered fx-col fx-start-v">
							{options.map((option, index) => {
								return (
									<div
										className="fit-container fx-centered"
										key={index}
									>
										<input
											type="text"
											className="if ifs-full"
											placeholder={'Add option'}
											value={option}
											onChange={e =>
												handleEditOption(
													e.target.value,
													index
												)
											}
										/>
										<div
											className="round-icon round-icon-tooltip"
											data-tooltip={'Delete'}
											onClick={() =>
												handleDeleteOption(index)
											}
										>
											<div className="trash"></div>
										</div>
									</div>
								);
							})}
							<div className="fit-container fx-scattered">
								<input
									type="text"
									className={`if ifs-full`}
									placeholder={'Add option'}
									value={tempOption}
									onChange={e =>
										setTempOption(e.target.value)
									}
								/>
								<div
									className={`round-icon round-icon-tooltip ${
										tempOption ? 'pointer' : 'if-disabled'
									}`}
									data-tooltip={'Add option'}
									onClick={handleAddOption}
								>
									<div
										className="plus-sign"
										style={{ cursor: 'unset' }}
									></div>
								</div>
							</div>

							{optionsEM && (
								<ErrorMessage
									message={
										'The options list must contain at least 2 items'
									}
								/>
							)}
						</div>
						<div
							className="fit-container fx-centered pointer"
							onClick={() =>
								setShowAdvancedOptions(!showAdvancedOptions)
							}
						>
							<p className="btn-text-gray">
								{'Advanced options'}
							</p>
							<div
								className="arrow"
								style={{
									rotate: showAdvancedOptions
										? '180deg'
										: '0deg',
								}}
							></div>
						</div>
						{showAdvancedOptions && (
							<div className="fit-container fx-centered fx-col slide-down">
								<Select
									options={ecosystemTypes}
									value={ecosystemType}
									setSelectedValue={data => {
										setEcosystemEM(false);
										setEcosystemType(data);
									}}
									defaultLabel={'Select an ecosystem'}
									fullWidth={true}
								/>
								{ecosystemEM && (
									<ErrorMessage
										message={'An ecosystem is required'}
									/>
								)}
								<input
									type="number"
									placeholder={'Snapshot height (optional)'}
									className={`if ifs-full ${
										!ecosystemType ? 'if-disabled' : ''
									}`}
									min={0}
									value={snapshotHeight}
									onChange={handleSnapshotHeight}
									disabled={!ecosystemType}
								/>
								{snapshotHeightEM && (
									<ErrorMessage
										message={`The snapshot height needs to be between ${makeReadableNumber(
											snapshotHeightInfo.lowestHeight
										)} and ${makeReadableNumber(
											snapshotHeightInfo.latestHeight
										)} or left empty`}
									/>
								)}
							</div>
						)}
						<div className="fit-container">
							<button
								className="btn btn-normal btn-full"
								disabled={isLoading}
								onClick={deployPoll}
							>
								{isLoading ? <LoadingDots /> : 'Deploy poll'}
							</button>
						</div>
						<p className="gray-c p-centered box-pad-h">
							The information above cannot be changed after the
							round is deployed. Please confirm the accuracy
							before proceeding.
						</p>
					</div>
				</div>
			)}
		</>
	);
};

const PollGasStation = ({ poll, signer, exit }) => {
	const dispatch = useDispatch();
	const [gasFee, setGasFee] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errMsg, setErrMsg] = useState(false);

	const addGasFees = async () => {
		try {
			setIsLoading(true);
			let amount = parseInt(gasFee) || 0;
			if (amount < 8) {
				setIsLoading(false);
				setErrMsg(true);
				return;
			}

			const client = new MaciClient({
				network: process.env.REACT_APP_NETWORK,
			});

			const oracleMaciClient = await client.oracleMaciClient({
				signer,
				contractAddress: poll,
			});
			amount = amount * 10 ** 18;
			await oracleMaciClient.bond(undefined, undefined, [
				{
					denom: 'peaka',
					amount: amount.toString(),
				},
			]);
			setIsLoading(false);
			dispatch(
				setToast({
					type: 1,
					desc: 'Balance was added successfully',
				})
			);
			exit();
		} catch (err) {
			console.log(err);
			setIsLoading(false);
			dispatch(
				setToast({
					type: 3,
					desc: 'An error has occurred!',
				})
			);
		}
	};

	return (
		<div
			className="fit-container box-pad-v fx-centered"
			style={{
				width: 'min(100%, 450px)',
				height: 'auto',
				position: 'relative',
			}}
			onClick={e => e.stopPropagation()}
		>
			<div className="fit-container fx-centered fx-col">
				<h4>Gas station</h4>
				<p className="gray-c p-centered box-pad-h">
					Add the required gas fees, otherwise, voting will be
					disabled (8 DORA per voter)
				</p>
				<input
					type="number"
					placeholder={'Amount'}
					value={gasFee}
					onChange={e => {
						setErrMsg(false);
						setGasFee(e.target.value);
					}}
					style={{ borderColor: errMsg ? 'var(--red-main)' : '' }}
					className="if ifs-full"
				/>
				{errMsg && (
					<ErrorMessage
						message={'A minimum of 8 DORA for each voter'}
					/>
				)}
				<button
					className="btn btn-normal btn-full"
					onClick={addGasFees}
				>
					{isLoading ? <LoadingDots /> : 'Add gas fee'}
				</button>
				<p>Or</p>
				<a
					href={`https://vota-test.dorafactory.org/round/${poll}`}
					target="_blank"
				>
					<p className="btn btn-text-gray btn-full">
						{isLoading ? <LoadingDots /> : 'Add later here'}
					</p>
				</a>
			</div>
		</div>
	);
};

const ComfirmationBox = ({ exit, handleClick }) => {
	return (
		<section className="fixed-container fx-centered box-pad-h">
			<section
				className="fx-centered fx-col sc-s-18 bg-sp box-pad-h box-pad-v"
				style={{ width: '450px' }}
			>
				<div
					className="fx-centered box-marg-s"
					style={{
						minWidth: '54px',
						minHeight: '54px',
						borderRadius: 'var(--border-r-50)',
						backgroundColor: 'var(--red-main)',
					}}
				>
					<div className="warning"></div>
				</div>
				<h3 className="p-centered">Warning</h3>
				<p className="p-centered gray-c box-pad-v-m">
					Editing the max number of options will reset the options
					list, do you wish to proceed?
				</p>
				<div className="fx-centered fit-container">
					<button
						className="fx btn btn-gst-red"
						onClick={handleClick}
					>
						Reset options
					</button>
					<button className="fx btn btn-red" onClick={exit}>
						Cancel
					</button>
				</div>
			</section>
		</section>
	);
};

const ErrorMessage = ({ message }) => {
	return (
		<div className="fit-container">
			<p className="red-c">{message}</p>
		</div>
	);
};
