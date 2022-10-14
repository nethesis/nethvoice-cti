import React, { createRef, RefObject } from 'react';
import { Meta, Story } from '@storybook/react';
import { Modal, ModalProps, Button, TextInput } from '../components/common';
import { useState } from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
};

export default meta as Meta;

export const Danger: Story<ModalProps> = (): JSX.Element => {
  const [showMondal, setShowMondal] = useState(false);
  const cancelButtonRef: RefObject<HTMLButtonElement> = createRef();

  return (
    <>
      <Button onClick={() => setShowMondal(true)}>Show modal</Button>
      <Modal
        show={showMondal}
        focus={cancelButtonRef}
        onClose={() => setShowMondal(false)}
      >
        <Modal.Content>
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
            <HiOutlineExclamation
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Delete account
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                The contact will be deleted definitevely from the phonebook.
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant="danger" onClick={() => setShowMondal(false)}>
            Delete
          </Button>
          <Button
            variant="white"
            onClick={() => setShowMondal(false)}
            ref={cancelButtonRef}
          >
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export const WithForm: Story<ModalProps> = (): JSX.Element => {
  const [showMondal, setShowMondal] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('submit', e.target);
    setShowMondal(false);
  };
  const nameInputRef: RefObject<HTMLInputElement> = createRef();

  return (
    <>
      <Button onClick={() => setShowMondal(true)}>Show modal</Button>
      <Modal
        show={showMondal}
        focus={nameInputRef}
        onClose={() => setShowMondal(false)}
      >
        <form onSubmit={handleSubmit}>
          <Modal.Content>
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900 text-center">
                Add account
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 text-center">
                  The contact will be added to the phonebook and will be available pubblicly by
default.
                </p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <TextInput
                  label="Name"
                  placeholder="Enter the name"
                  name="name"
                  ref={nameInputRef}
                />
                <TextInput
                  label="Surname"
                  placeholder="Enter the surname"
                  name="surname"
                />
                <TextInput
                  label="Number"
                  placeholder="Enter the number"
                  name="number"
                />
              </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button variant="primary" onClick={() => setShowMondal(false)}>
              Save
            </Button>
            <Button
              variant="white"
              onClick={() => setShowMondal(false)}
            >
              Cancel
            </Button>
          </Modal.Actions>
        </form>
      </Modal>
    </>
  );
};