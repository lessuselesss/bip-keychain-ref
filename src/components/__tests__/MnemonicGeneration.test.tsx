import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as bip39 from 'bip39';
import { MnemonicGenerator } from '../MnemonicGeneration';

// Mock bip39 to control the generated mnemonic
jest.mock('bip39', () => ({
  ...jest.requireActual('bip39'),
  generateMnemonic: jest.fn(),
  validateMnemonic: jest.fn(),
  mnemonicToEntropy: jest.fn(),
}));

// Mock toast to avoid errors during tests
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MnemonicGenerator', () => {
  const setMnemonic = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (bip39.generateMnemonic as jest.Mock).mockReturnValue('test test test test test test test test test test test junk');
    (bip39.mnemonicToEntropy as jest.Mock).mockReturnValue('daeda1a2ce362175db5a7c3697c320a3');
  });

  test('renders the component correctly', () => {
    render(<MnemonicGenerator mnemonic="" setMnemonic={setMnemonic} />);
    expect(screen.getByText('Mnemonic Phrase')).toBeInTheDocument();
  });

  test('generates a 12-word mnemonic by default', () => {
    render(<MnemonicGenerator mnemonic="" setMnemonic={setMnemonic} />);
    const generateButton = screen.getByText('Generate New Seed');

    fireEvent.click(generateButton);

    expect(bip39.generateMnemonic).toHaveBeenCalledWith(128);
    expect(setMnemonic).toHaveBeenCalledWith('test test test test test test test test test test test junk');
  });

  test('generates a 24-word mnemonic when selected', async () => {
    render(<MnemonicGenerator mnemonic="" setMnemonic={setMnemonic} />);

    const wordCountSelect = screen.getByRole('combobox');
    await userEvent.click(wordCountSelect);

    // In the original code, this was commented out. It is now fixed.
    await userEvent.selectOptions(wordCountSelect, '24');

    (bip39.generateMnemonic as jest.Mock).mockClear();
    (bip39.generateMnemonic as jest.Mock).mockReturnValue('test test test test test test test test test test junk test test test test test test test test test test test junk');

    const generateButton = screen.getByText('Generate New Seed');
    fireEvent.click(generateButton);

    expect(bip39.generateMnemonic).toHaveBeenCalledWith(256);
  });

  test('validates a correct mnemonic on input', () => {
    (bip39.validateMnemonic as jest.Mock).mockReturnValue(true);
    const validMnemonic = 'test test test test test test test test test test test junk';
    render(<MnemonicGenerator mnemonic="" setMnemonic={setMnemonic} />);
    const textarea = screen.getByPlaceholderText('Enter or generate a BIP39 mnemonic phrase...');

    fireEvent.change(textarea, { target: { value: validMnemonic } });

    expect(setMnemonic).toHaveBeenCalledWith(validMnemonic);
    expect(bip39.validateMnemonic).toHaveBeenCalledWith(validMnemonic);
  });

  test('shows an error for an invalid mnemonic', () => {
    (bip39.validateMnemonic as jest.Mock).mockReturnValue(false);
    const invalidMnemonic = 'this is not a valid mnemonic';
    render(<MnemonicGenerator mnemonic={invalidMnemonic} setMnemonic={setMnemonic} />);

    // Since the validation is done on input, we pass the invalid mnemonic as a prop
    // and assert that the invalid badge is shown
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  test('copies the mnemonic to the clipboard', async () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    render(<MnemonicGenerator mnemonic={mnemonic} setMnemonic={setMnemonic} />);

    const copyButton = screen.getByText('Copy Mnemonic');

    // Mock the clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mnemonic);
  });
});
