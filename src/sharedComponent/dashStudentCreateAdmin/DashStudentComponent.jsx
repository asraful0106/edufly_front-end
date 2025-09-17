import React, { useState, useRef, useContext, useMemo, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { IoCreateOutline } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import { FaCircleCheck } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import Lottie from 'lottie-react';

import loadingLottie from '../../lottie/loading.json';
import EachDashStudent from './EachDashStudent';
import FullStudentInfoContext from '../../contextapi/fullStudentEnfo/FullStudentInfoContext';
import BatchContext from '../../contextapi/batch/BatchContext';

const DashStudentComponent = () => {
    const currentLocation = useLocation();

    // ---- Safe EIIN extraction (no lookbehind; never index into null) ----
    const eiinValue = useMemo(() => {
        // Matches "/12345" or "/12345/..." and returns the numeric capture
        const m = currentLocation.pathname.match(/\/(\d+)(?:\/|$)/);
        return m ? m[1] : null;
    }, [currentLocation.pathname]);

    const [searchType, setSearchType] = useState("ID");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef(null);

    // ---- Form state ----
    const [formData, setFormData] = useState({
        name_eng: '',
        name_bng: '',
        student_id: '',
        batch_id: '', // will hold the batch's primary key (id)
        class_roll: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        religion: 'islam',
        gender: 'male',
        present_adress: '',
        parmanent_adress: '',
        blood_group: 'A+',
        status: 'current',
        role: 'student'
    });

    // ---- Image inputs ----
    const inputProfileImageRef = useRef(null);
    const inputSignatureImageRef = useRef(null);
    const [image, setImage] = useState(null);
    const [signature, setSignature] = useState(null);
    const [previewProfileImage, setPreviewProfileImage] = useState(null);
    const [previewSignatureImage, setPreviewSignatureImage] = useState(null);

    // ---- Create student UX state ----
    const [createStudentLoading, setCreateStudentLoading] = useState(false);
    const [createStudentSuccess, setCreateStudentSuccess] = useState(false);
    const [createStudentError, setCreateStudentError] = useState("");

    // ---- Student ID availability ----
    const [studentIdAvailabilityToggled, setStudentIdAvailabilityToggled] = useState(false);
    const [studentIdAvailable, setStudentIdAvailable] = useState(false);

    // ---- Context for fetching & listing ----
    const { fullStudentData, featchFullStudentData, fullStudentLoading, fullStudentError } =
        useContext(FullStudentInfoContext);
    // ---- Context for Batch ----
    const { batchData, fetchAllBatch } = useContext(BatchContext);

    // ---- Memoized debounced check; cancel on unmount ----
    const debouncedCheckStudentId = useMemo(
        () =>
            _.debounce(async (studentId, eiin) => {
                try {
                    setStudentIdAvailabilityToggled(true);
                    const { data } = await axios.get(
                        `${import.meta.env.VITE_BACKEND_LINK}/student/isAvailable?institution_id=${eiin}&student_id=${studentId}`
                    );
                    setStudentIdAvailable(!data.sid_exist);
                } catch (error) {
                    console.error('Error checking student ID:', error);
                    setStudentIdAvailable(false);
                }
            }, 500),
        []
    );

    useEffect(() => {
        return () => debouncedCheckStudentId.cancel();
    }, [debouncedCheckStudentId]);

    // ---- Fetch the student list and batch data when eiinValue becomes available ----
    useEffect(() => {
        if (eiinValue) {
            featchFullStudentData(`${import.meta.env.VITE_BACKEND_LINK}/student/${eiinValue}`);
            fetchAllBatch(`${import.meta.env.VITE_BACKEND_LINK}/batch`, eiinValue);
            console.log(`${import.meta.env.VITE_BACKEND_LINK}/student/${eiinValue}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eiinValue]);

    // ---- Auto-select first batch when batchData loads (prevents empty batch_id) ----
    useEffect(() => {
        if (batchData?.length && !formData.batch_id) {
            setFormData(prev => ({
                ...prev,
                batch_id: String(batchData[0].id ?? batchData[0]._id)
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchData]);

    // ---- Handlers ----
    const handleDropdownToggle = (e) => {
        e.preventDefault();
        setDropdownOpen((prev) => !prev);
    };

    const handleDropdownSelect = (type) => {
        setSearchType(type);
        setDropdownOpen(false);
        inputRef.current?.focus();
    };

    const handleSearchInput = (e) => setSearchValue(e.target.value);

    const handleSearch = (e) => {
        e.preventDefault();
        alert(`Searching by ${searchType}: ${searchValue}`);
    };

    const handleCreate = () => setIsCreating(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "student_id") {
            if (value && eiinValue) {
                debouncedCheckStudentId(value, eiinValue);
            } else {
                setStudentIdAvailabilityToggled(false);
                setStudentIdAvailable(false);
            }
        }
    };

    const handleProfileImageUpload = () => {
        const file = inputProfileImageRef.current?.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
        if (!validTypes.includes(file.type)) {
            setCreateStudentError('Only JPG, PNG, GIF, or AVIF files are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setCreateStudentError('File size must be less than 5MB');
            return;
        }

        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewProfileImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSignatureImageUpload = () => {
        const file = inputSignatureImageRef.current?.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
        if (!validTypes.includes(file.type)) {
            setCreateStudentError('Only JPG, PNG, GIF, or AVIF files are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setCreateStudentError('File size must be less than 5MB');
            return;
        }

        setSignature(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewSignatureImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreateStudentError('');
        setCreateStudentLoading(true);

        if (!eiinValue) {
            setCreateStudentLoading(false);
            toast.error("Invalid URL: missing institution ID.", { position: "top-right" });
            return;
        }

        if (!studentIdAvailable) {
            toast.error("Student ID must be unique!", { position: "top-right" });
            setCreateStudentLoading(false);
            return;
        }

        if (!image) {
            setCreateStudentError('Student image is required');
            setCreateStudentLoading(false);
            return;
        }

        if (!formData.batch_id) {
            toast.error("Please select a batch.", { position: "top-right" });
            setCreateStudentLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') data.append(key, value);
            });
            data.append('image', image, `${image.name}`);
            if (signature) data.append('signature', signature, `${signature.name}`);
            console.log("From Data: ", formData);

            await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/student/${eiinValue}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setCreateStudentSuccess(true);
            setFormData({
                name_eng: '',
                name_bng: '',
                student_id: '',
                batch_id: batchData?.length ? String(batchData[0].id ?? batchData[0]._id) : '',
                class_roll: '',
                email: '',
                phone_number: '',
                date_of_birth: '',
                religion: 'islam',
                gender: 'male',
                present_adress: '',
                parmanent_adress: '',
                blood_group: 'A+',
                status: 'current',
                role: 'student'
            });
            setImage(null);
            setPreviewProfileImage(null);
            setSignature(null);
            setPreviewSignatureImage(null);
            setCreateStudentError('');
            setCreateStudentLoading(false);
            setCreateStudentSuccess(false);
            setStudentIdAvailabilityToggled(false);
            setStudentIdAvailable(false);

            toast.success("Student Created Successfully!", { position: "top-right" });

            // refresh list
            featchFullStudentData(`${import.meta.env.VITE_BACKEND_LINK}/student/${eiinValue}`);
        } catch (err) {
            console.error('Error Creating Student:', err);
            setCreateStudentLoading(false);
            toast.error("Something went wrong! Unable to create student.", { position: "top-right" });
        }
    };

    return (
        <div>
            <div className='flex items-center justify-center'>
                <div>
                    {/* Search and new student entry section */}
                    {!isCreating && (
                        <div className='w-full bg-gray-800 rounded-xl py-8 px-8 mt-10 mx-16 flex items-center justify-between'>
                            {/* Search box */}
                            <form onSubmit={handleSearch}>
                                <div className="w-full max-w-sm min-w-[200px] bg-white rounded">
                                    <div className="relative mt-2">
                                        <div className="absolute top-1 left-1 flex items-center z-20">
                                            <button
                                                id="dropdownButton"
                                                type="button"
                                                onClick={handleDropdownToggle}
                                                className="rounded border border-transparent py-1 px-1.5 text-center flex items-center text-sm transition-all text-slate-600"
                                            >
                                                <span id="dropdownSpan" className="text-ellipsis overflow-hidden">
                                                    {searchType}
                                                </span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 ml-1"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </button>
                                            <div className="h-6 border-l border-slate-200 ml-1" />
                                            <div
                                                id="dropdownMenu"
                                                className={`min-w-[150px] absolute left-0 mt-10 bg-white border border-slate-200 rounded-md shadow-lg z-30 ${dropdownOpen ? "" : "hidden"}`}
                                            >
                                                <ul id="dropdownOptions">
                                                    <li
                                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 text-sm cursor-pointer"
                                                        onClick={() => handleDropdownSelect("ID")}
                                                    >
                                                        ID
                                                    </li>
                                                    <li
                                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 text-sm cursor-pointer"
                                                        onClick={() => handleDropdownSelect("Name")}
                                                    >
                                                        Name
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchValue}
                                            onChange={handleSearchInput}
                                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pr-12 pl-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                            placeholder={searchType === "ID" ? "Enter student ID..." : "Enter student name..."}
                                        />
                                        <button
                                            className="absolute right-1 top-1 rounded bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                            type="submit"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Create new student button */}
                            <div>
                                <button
                                    onClick={handleCreate}
                                    className="flex items-center mt-1 p-2 rounded-lg text-black group bg-white"
                                >
                                    <IoCreateOutline className="w-5 h-5 transition duration-75" />
                                    <span className="flex-1 ms-3 whitespace-nowrap">Create</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form for creating new student */}
            {isCreating && (
                <div className='relative'>
                    <div className='p-10 m-10 bg-white rounded-2xl shadow-2xl'>
                        <h6 className='font-bold mb-4'>Profile Photo</h6>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <div className='flex items-center gap-6 mt-6'>
                                    <div className="avatar">
                                        <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                                            <img
                                                src={previewProfileImage || "/no_image.png"}
                                                alt="Profile Preview"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs mt-2 text-gray-400">JPG, GIF, PNG, or AVIF. Maximum File Size 5MB</p>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/gif, image/avif"
                                            className="hidden"
                                            onChange={handleProfileImageUpload}
                                            ref={inputProfileImageRef}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => inputProfileImageRef.current?.click()}
                                            className="mt-4 text-sm text-gray-500 py-2 px-4 rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
                                        >
                                            Change Photo
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-x-10 gap-y-2 mt-10'>
                                    {/* Student Name English */}
                                    <div className="mb-4">
                                        <label htmlFor='name_eng' className="block mb-1 font-medium">Name (English)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.name_eng}
                                            name='name_eng'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    {/* Student Name Bangla */}
                                    <div className="mb-4">
                                        <label htmlFor='name_bng' className="block mb-1 font-medium">Name (Bangla)</label>
                                        <input
                                            type="text"
                                            name='name_bng'
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.name_bng}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    {/* Student ID */}
                                    <div className="mb-4 relative">
                                        <label htmlFor='student_id' className="block mb-1 font-medium">Student ID</label>
                                        <input
                                            type="text"
                                            className={`w-full border rounded px-3 py-2 focus:outline-none ${!studentIdAvailable && studentIdAvailabilityToggled ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-blue-400"}`}
                                            value={formData.student_id}
                                            name='student_id'
                                            onChange={handleInputChange}
                                            required
                                        />

                                        {studentIdAvailabilityToggled && (
                                            <div className='absolute -bottom-6'>
                                                {!studentIdAvailable && (
                                                    <p className='text-red-500 text-sm'>Student ID already exists</p>
                                                )}
                                            </div>
                                        )}
                                        {studentIdAvailabilityToggled && (
                                            <div className='absolute right-2 bottom-[0.65rem]'>
                                                {studentIdAvailable ? (
                                                    <FaCircleCheck className='text-green-400' />
                                                ) : (
                                                    <MdCancel className='text-red-400' />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Class Roll */}
                                    <div className="mb-4">
                                        <label htmlFor='class_roll' className="block mb-1 font-medium">Class Roll</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.class_roll}
                                            name='class_roll'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    {/* Batch ID */}
                                    <div>
                                        <label htmlFor="batch_id" className="block mb-1 font-medium">Batch</label>
                                        <select
                                            name="batch_id"
                                            id="batch_id"
                                            value={formData.batch_id || ""}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                            required
                                        >
                                            <option value="" disabled>Select batch</option>
                                            {batchData?.map((b) => (
                                                <option
                                                    key={b.id || b._id}
                                                    value={String(b.id ?? b._id)}  // send primary key id
                                                >
                                                    {b.batch_code}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Student Email */}
                                    <div className="mb-4">
                                        <label htmlFor='email' className="block mb-1 font-medium">Student Email</label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.email}
                                            name='email'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    {/* Student Phone Number */}
                                    <div className="mb-4">
                                        <label htmlFor='phone_number' className="block mb-1 font-medium">Student Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='phone_number'
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    {/* Permanent Address */}
                                    <div className="mb-4">
                                        <label htmlFor='parmanent_adress' className="block mb-1 font-medium">Permanent Address</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='parmanent_adress'
                                            value={formData.parmanent_adress}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* Present Address */}
                                    <div className="mb-4">
                                        <div className='flex items-center justify-between'>
                                            <label htmlFor='present_adress' className="block mb-1 font-medium">Present Address</label>
                                            <div className='flex items-center'>
                                                <input type="checkbox" name='permanentCheck' id='permanentCheck' />
                                                <label className='ml-1' htmlFor="permanentCheck">Same as Permanent Address</label>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='present_adress'
                                            value={formData.present_adress}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="mb-4 flex items-center gap-x-6">
                                        {/* Date of Birth */}
                                        <div>
                                            <label htmlFor='date_of_birth' className="block mb-1 font-medium">Date of Birth</label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                                name='date_of_birth'
                                                value={formData.date_of_birth}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label htmlFor="status" className="block mb-1 font-medium">Status</label>
                                            <select
                                                name="status"
                                                id="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="current">Current</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="graduated">Graduated</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex items-center gap-4">
                                        {/* Signature */}
                                        <div>
                                            <label htmlFor='signature' className="block mb-1 font-medium">Signature</label>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept='image/png, image/jpeg, image/jpg, image/avif'
                                                name='signature'
                                                onChange={handleSignatureImageUpload}
                                                ref={inputSignatureImageRef}
                                            />
                                            <div className='flex items-center gap-x-4'>
                                                <div className='h-10 w-[10rem] rounded'>
                                                    <img className='w-full h-full object-cover' src={previewSignatureImage || ''} alt="" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => inputSignatureImageRef.current?.click()}
                                                    className="text-sm text-gray-500 py-4 px-4 rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
                                                >
                                                    <LuUpload />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Blood Group */}
                                        <div>
                                            <label htmlFor="blood_group" className="block mb-1 font-medium">Blood Group</label>
                                            <select
                                                name="blood_group"
                                                id="blood_group"
                                                value={formData.blood_group}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                            >
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>

                                        {/* Gender */}
                                        <div>
                                            <label htmlFor="gender" className="block mb-1 font-medium">Gender</label>
                                            <select
                                                name="gender"
                                                id="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {/* Religion */}
                                        <div>
                                            <label htmlFor="religion" className="block mb-1 font-medium">Religion</label>
                                            <select
                                                name="religion"
                                                id="religion"
                                                value={formData.religion}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="islam">Islam</option>
                                                <option value="christianity">Christianity</option>
                                                <option value="hinduism">Hinduism</option>
                                                <option value="buddhism">Buddhism</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className='w-full flex items-center justify-center mt-6'>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-10 py-2 rounded hover:bg-blue-700 transition"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className='relative left-[83rem] bottom-[51rem]'>
                        <button type="button" onClick={() => setIsCreating(false)}>
                            <MdCancel className='text-2xl' />
                        </button>
                    </div>

                    {createStudentLoading && (
                        <div className='absolute top-1/2 right-1/2 -translate-1/2'>
                            <Lottie animationData={loadingLottie} loop={true} />
                        </div>
                    )}
                </div>
            )}

            {/* Displaying Student List */}
            <div className='mt-10 px-4'>
                {(!fullStudentData || fullStudentData.length === 0) && !fullStudentError && !fullStudentLoading && (
                    <div className='w-full min-h-[35rem] flex items-center justify-center'>
                        <h1 className='text-2xl text-gray-400/95'>No student found!</h1>
                    </div>
                )}

                {!fullStudentError && fullStudentLoading && (
                    <div className='w-full min-h-[35rem] flex items-center justify-center'>
                        <Lottie animationData={loadingLottie} loop={true} />
                    </div>
                )}

                {Array.isArray(fullStudentData) && fullStudentData.length > 0 && !fullStudentError && !fullStudentLoading && (
                    <div className='grid grid-cols-3 gap-6'>
                        {fullStudentData.map((studentData) => (
                            <EachDashStudent
                                key={studentData._id || studentData.id}
                                studentData={studentData}
                                featchFullStudentData={featchFullStudentData}
                            />
                        ))}
                    </div>
                )}

                {fullStudentError && (
                    <div className='w-full min-h-[10rem] flex items-center justify-center'>
                        <p className='text-red-600'>Failed to load students.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashStudentComponent;
