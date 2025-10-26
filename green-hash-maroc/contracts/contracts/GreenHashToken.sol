// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract GreenHashToken is ERC20, ERC20Burnable, Pausable, Ownable, ERC20Permit {
    
    // Taxe écologique de 0.1%
    uint256 public constant ECOLOGICAL_TAX = 10; // 0.1% = 10 / 10000
    uint256 public constant TAX_DENOMINATOR = 10000;
    
    // Adresse du wallet écologique
    address public ecologicalWallet;
    
    // Événements
    event EcologicalTaxCollected(address indexed from, address indexed to, uint256 amount);
    event EcologicalWalletChanged(address indexed oldWallet, address indexed newWallet);
    
    constructor(
        address _ecologicalWallet
    ) 
        ERC20("Green Hash Token", "GREENHASH") 
        ERC20Permit("Green Hash Token")
    {
        require(_ecologicalWallet != address(0), "GreenHashToken: ecological wallet cannot be zero address");
        
        ecologicalWallet = _ecologicalWallet;
        
        // Mint initial supply (100M tokens)
        _mint(msg.sender, 100000000 * 10**decimals());
    }
    
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function setEcologicalWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "GreenHashToken: wallet cannot be zero address");
        
        address oldWallet = ecologicalWallet;
        ecologicalWallet = _newWallet;
        
        emit EcologicalWalletChanged(oldWallet, _newWallet);
    }
    
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override whenNotPaused {
        // Vérifier si l'expéditeur ou le destinataire est exonéré de taxe
        bool isTaxExempt = _isTaxExempt(sender, recipient);
        
        if (!isTaxExempt && ECOLOGICAL_TAX > 0) {
            uint256 taxAmount = (amount * ECOLOGICAL_TAX) / TAX_DENOMINATOR;
            uint256 transferAmount = amount - taxAmount;
            
            // Transférer la taxe au wallet écologique
            super._transfer(sender, ecologicalWallet, taxAmount);
            
            // Transférer le montant net au destinataire
            super._transfer(sender, recipient, transferAmount);
            
            emit EcologicalTaxCollected(sender, recipient, taxAmount);
        } else {
            // Transfert sans taxe
            super._transfer(sender, recipient, amount);
        }
    }
    
    function _isTaxExempt(address sender, address recipient) internal view returns (bool) {
        // Exonérer le owner et le wallet écologique des taxes
        return sender == owner() || 
               recipient == owner() || 
               sender == ecologicalWallet || 
               recipient == ecologicalWallet;
    }
    
    // Fonction pour mint des tokens (uniquement owner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // Fonction pour brûler des tokens depuis n'importe quelle adresse (uniquement owner)
    function burnFrom(address account, uint256 amount) public override onlyOwner {
        super.burnFrom(account, amount);
    }
    
    // Récupérer le solde du wallet écologique
    function getEcologicalWalletBalance() external view returns (uint256) {
        return balanceOf(ecologicalWallet);
    }
    
    // Récupérer le montant total des taxes collectées
    function getTotalTaxCollected() external view returns (uint256) {
        return balanceOf(ecologicalWallet);
    }
}