import React, { useEffect, useState, useRef } from 'react'
import {
	Input,
	DatePicker,
	Button,
	Divider,
	Popconfirm,
	Tag,
	Form,
	Modal,
} from 'antd'
import { UserOutlined, WarningOutlined } from '@ant-design/icons'
import moment from 'moment'
import { formatDate2 } from '../../utils/common/date-utils'
import TagInput from '../../components/inputs/InputTag'
import InputSearchLead from '../../components/inputs/InputSearchLead'
import { getRelatedLeads } from '../../api'
import styled from 'styled-components'
import { IAppState } from '../../redux/reducers/rootReducer'
import { useSelector, useDispatch } from 'react-redux'
import { WorkingActionTypes } from '../../redux/constants/working/workingConstants'
const { RangePicker } = DatePicker

const mapToValue = (data: TODO, isLeadid = false) => {
	let result = []

	for (let i = 0; i < data.length; i++) {
		if (!isLeadid) {
			result.push(data[i].value)
		} else {
			result.push(data[i].id)
		}
	}

	if (isLeadid) return result
	return result.join(',')
}

const mapToLabel = (value: string) => {
	if (!value)
		return {
			value: [],
			focused: false,
			inputValue: '',
		}
	const arr = value.split(',')

	let data: any = {
		value: [],
		focused: false,
		inputValue: '',
	}

	for (let i = 0; i < arr.length; i++) {
		const num = arr[i]
		data.value.push({ label: num, value: num })
	}

	return data
}

interface EditorWindowProps {
	dataSelected: any
	type: string
	onSubmit: (data: TODO, close?: boolean) => void
	loading: boolean
	onClose: () => void
}

const EditorWindow: React.FC<EditorWindowProps> = ({
	dataSelected,
	type,
	onSubmit,
	loading,
	onClose,
}) => {
	const startDate =
		type === 'new'
			? dataSelected?.startTime?.toString()
			: dataSelected?.startDateTime?.toString()
	const endDate =
		type === 'new'
			? dataSelected?.endTime?.toString()
			: dataSelected?.endDateTime?.toString()
	const [startDateTime, setStartDateTime] = useState<string>(
		formatDate2(startDate) || ''
	)
	const [endDateTime, setEndDateTime] = useState<string>(
		formatDate2(endDate) || ''
	)
	const [name, setName] = useState<string>(
		dataSelected?.name !== 'cellClick' ? dataSelected?.name : '' || ''
	)
	const [description, setDescription] = useState<string>(
		dataSelected?.description || ''
	)
	const [location, setLocation] = useState<string>(
		dataSelected?.location || ''
	)
	const [participator, setParticipator] = useState(
		mapToLabel(dataSelected?.participator)
	)
	const [errParticipator, setErrParticipator] = useState<string>('')

	const [leads, setLeads] = useState({
		value: [],
		focused: false,
		inputValue: '',
	})
	const workDrawerState = useSelector(
		(state: IAppState) => state.workingDrawer
	)
	const { detail } = workDrawerState
	const dispatch = useDispatch()
	const formRef = useRef<any>(null)
	useEffect(() => {
		if (dataSelected?.leadIds?.length) {
			fetchRelatedLead(dataSelected?.leadIds)
		}
	}, [])

	const fetchRelatedLead = async (leadArr: number[]) => {
		try {
			console.log('leadArr', leadArr)
			const res = await getRelatedLeads(leadArr)
			const responseData = res?.data?.responseData
			setLeads({
				value: responseData?.map((item: TODO) => {
					return {
						label: item.fullName,
						value: item.fullName,
						id: item.id,
					}
				}),
				focused: false,
				inputValue: '',
			})
			console.log('res relateed', res)
		} catch (err) {
			console.log('err', err)
		}
	}

	// const [leadIds, setLeadIds] = useState<number[]>([])
	function onChangeDate(value: any, dateString: any) {
		if (!value?.[0] && !value?.[1]) {
			setStartDateTime('')
			setEndDateTime('')
		} else {
			setStartDateTime(value[0].format('YYYY-MM-DD HH:mm:ss'))
			setEndDateTime(value[1].format('YYYY-MM-DD HH:mm:ss'))
		}
		console.log('Selected Time: ', value)
		console.log('Formatted Selected Time: ', dateString)
	}

	function onOkDate(value: any) {
		console.log('_d', value?._d?.getTime())
	}

	async function confirmDelete(id: number) {}

	const handleSubmit = (createNew = false) => {
		const participatorData = mapToValue(participator.value)
		let data: any = {
			name,
			description,
			location,
			startDateTime: startDateTime.replace(/\s/g, 'T'),
			endDateTime: endDateTime.replace(/\s/g, 'T'),
			participator: participatorData,
			leadIds: mapToValue(leads.value, true),
		}

		if (type === 'update') {
			data = { ...data, id: dataSelected?.id }
		}
		console.log('data submit', data)

		if (createNew) {
			clearFields()
			onSubmit(data, false)
		} else {
			onSubmit(data)
		}
	}

	const clearFields = () => {
		setName('')
		setDescription('')
		setLocation('')
		setStartDateTime('')
		setEndDateTime('')
		setParticipator({
			value: [],
			focused: false,
			inputValue: '',
		})
		setLeads({
			value: [],
			focused: false,
			inputValue: '',
		})
		formRef?.current?.setFieldsValue({ time: null })
	}
	const ready = name && startDateTime && endDateTime

	function confirm() {
		Modal.confirm({
			title: 'Xóa lịch hẹn',
			icon: <WarningOutlined style={{ color: '#DC2626' }} />,
			content: 'Bạn có chắc chắn muốn xóa lịch hẹn này không?',
			okText: 'Xóa',
			cancelText: 'Để sau',
			okButtonProps: { danger: true },
			onOk: () => confirmDelete(dataSelected.id),
			width: 450,
		})
	}
	return (
		<>
			{!detail ? (
				<div>
					<Wrapper>
						<div>
							<span className='label'>Tiêu đề *</span>
							<Input
								placeholder='Nhập nội dung'
								value={name}
								onChange={e => setName(e.target.value)}
							/>
						</div>
						<div>
							<span className='label'>Lead liên quan</span>
							<InputSearchLead
								state={leads}
								setState={setLeads}
							/>
						</div>
						<div>
							<span className='label'>Thời gian *</span>
							<FormStyled ref={formRef}>
								<Form.Item name='time'>
									<RangePickerStyle
										onChange={onChangeDate}
										onOk={onOkDate}
										showTime={{ format: 'HH:mm' }}
										format='DD/MM/YYYY HH:mm'
										placeholder={['Bắt đầu', 'Kết thúc']}
										defaultValue={
											type !== 'brand-new'
												? [
														moment(
															startDateTime,
															'YYYY/MM/DD HH:mm:ss'
														),
														moment(
															endDateTime,
															'YYYY/MM/DD HH:mm:ss'
														),
												  ]
												: undefined
										}
									/>
								</Form.Item>
							</FormStyled>
						</div>
						<div>
							<span className='label'>Thành phần tham gia</span>
							<TagInput
								style={{ background: '#ffffff', marginTop: 0 }}
								fieldName='email'
								state={participator}
								setState={setParticipator}
								errMessage={errParticipator}
								setErrMessage={setErrParticipator}
							/>
						</div>

						<div>
							<span className='label'>Địa điểm</span>
							<Input
								placeholder='Nhập thông tin'
								value={location}
								onChange={e => setLocation(e.target.value)}
							/>
						</div>
						<div>
							<span className='label'>Mô tả</span>
							<Input.TextArea
								autoSize={{ minRows: 3 }}
								placeholder='Nhập thông tin'
								value={description}
								onChange={e => setDescription(e.target.value)}
							/>
						</div>
					</Wrapper>
					<div style={{ paddingLeft: 24, paddingRight: 24 }}>
						<Divider style={{ margin: '20px 0px' }} />

						<ActionWrapper>
							<Popconfirm
								title='Bạn có chắc chắn muốn xóa?'
								onConfirm={() => confirmDelete(dataSelected.id)}
								onCancel={() => {}}
								okText='Có'
								cancelText='Không'
							>
								{dataSelected?.id && detail && (
									<Button disabled={loading}>Xóa</Button>
								)}
							</Popconfirm>
							<div>
								<Button
									disabled={!ready || loading}
									onClick={
										ready ? () => handleSubmit() : () => {}
									}
									type='primary'
									loading={loading}
									style={{ marginRight: '5px' }}
								>
									Lưu
								</Button>
								{type !== 'update' && !detail &&  (
								<Button
									disabled={!ready || loading}
									onClick={
										ready
											? () => handleSubmit(true)
											: () => {}
									}
									type='primary'
									loading={loading}
								>
									Lưu và Thêm mới
								</Button>)}
							</div>
						</ActionWrapper>
					</div>
				</div>
			) : (
				<div>
					<Wrapper>
						<div>
							<span className='label' style={{ marginBottom: 0 }}>
								Lead liên quan
							</span>
							<div>
								{leads?.value?.length > 0 &&
									leads.value.map((item: TODO) => {
										return (
											<Tag
												icon={
													<UserOutlined
														style={{
															color: '#ffffff',
														}}
													/>
												}
												color='#108ee9'
												key={item?.value}
												style={{
													padding: '0.2rem',
													margin: '5px 5px 0 0',
												}}
											>
												<span
													style={{ color: '#ffffff' }}
												>
													{item?.value}
												</span>
											</Tag>
										)
									})}
							</div>
						</div>
						<div>
							<span className='label'>Thời gian</span>
							<Tag style={{ padding: '0.3rem' }}>
								<span style={{ color: '#8083A3' }}>
									{formatDate2(startDateTime)}
								</span>
							</Tag>
							<Tag style={{ padding: '0.3rem' }}>
								<span style={{ color: '#8083A3' }}>
									{formatDate2(endDateTime)}
								</span>
							</Tag>
						</div>
						<div>
							<span className='label' style={{ marginBottom: 0 }}>
								Thành phần tham gia
							</span>
							{participator?.value?.length > 0 &&
								participator.value.map((item: TODO) => {
									return (
										<Tag
											icon={
												<UserOutlined
													style={{ color: '#ffffff' }}
												/>
											}
											color='#108ee9'
											key={item?.value}
											style={{
												padding: '0.2rem',
												margin: '5px 5px 0 0',
											}}
										>
											<span style={{ color: '#ffffff' }}>
												{item?.value}
											</span>
										</Tag>
									)
								})}
						</div>
						<div>
							<span className='label'>Địa điểm</span>
							<p>{location}</p>
						</div>
						<div>
							<span className='label'>Mô tả</span>
							<p>{description}</p>
						</div>
					</Wrapper>
					<div style={{ paddingLeft: 24, paddingRight: 24 }}>
						<Divider style={{ margin: '20px 0px' }} />

						<ActionWrapper>
							{dataSelected?.id && (
								<Button
									onClick={() => confirm()}
									disabled={loading}
								>
									Xóa
								</Button>
							)}
							<div>
								<Button
									disabled={!ready || loading}
									onClick={() =>
										dispatch({
											type:
												WorkingActionTypes.TOGGLE_WORKING_DETAIL_DRAWER,
											payload: false,
										})
									}
									type='primary'
									loading={loading}
								>
									Cập nhật
								</Button>
							</div>
						</ActionWrapper>
					</div>
				</div>
			)}
		</>
	)
}
export default EditorWindow

const Wrapper = styled.div`
	max-height: 75vh;
	overflow-y: auto;
	padding: 20px 24px;
	display: grid;
	grid-gap: 20px;
	.label {
		color: #4e5d78;
		display: block;
		margin-bottom: 5px;
	}
	.ant-picker,
	ul {
		input {
			border-radius: 6px;
		}
	}

	.ant-picker {
		border-radius: 6px;
	}
`

const ActionWrapper = styled.div`
	display: flex;
	justify-content: space-between;
`
const RangePickerStyle = styled(RangePicker)`
	.ant-picker-input > input {
		/* font-size: 13px; */
		width: 100%;
	}
`

const FormStyled = styled(Form)`
	.ant-row.ant-form-item {
		margin-bottom: 0 !important;
	}
`
