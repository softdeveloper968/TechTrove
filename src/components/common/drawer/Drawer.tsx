import React, { ReactNode, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

type DrawerProps = {
    openDrawer: boolean;
    onClose: () => void;
    children?: ReactNode;
};

const Drawer = (props: DrawerProps) => {
    return (
        <Transition.Root show={props.openDrawer} as={Fragment}>
            <Dialog as="div" className="relative z-[40] drawer-modal" onClose={() => props.onClose()}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-[8]" />
                </Transition.Child>

                <div className="fixed inset-y-0 right-0 top-[48px] flex max-w-[calc(100%_-_228px)] z-[9] drawer-content">
                    <Transition.Child
                        as={Fragment}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                    >
                        <Dialog.Panel className="relative w-screen max-w-full">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-in-out duration-500"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in-out duration-500"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="absolute md:-left-8 md:top-1.5 flex z-10">
                                    <button
                                        type="button"
                                        className="relative rounded-md text-gray-500 hover:text-gray-600 outline-none h-7 w-7 bg-white flex items-center justify-center"
                                        onClick={() => props.onClose()}
                                    >
                                        <span className="absolute -inset-2" />
                                        <span className="sr-only">Close panel</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </Transition.Child>
                            <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                                {/* <div className="px-4 sm:px-6">
                                            <Dialog.Title className="text-sm font-semibold leading-5 text-gray-900">
                                                Panel title
                                            </Dialog.Title>
                                        </div> */}
                                <div className="relative">
                                    {props.children}
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default Drawer;