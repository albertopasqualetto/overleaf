import { startWith } from './helpers/config'
import { ensureUserExists, login } from './helpers/login'

describe('LearnWiki', function () {
  const COPYING_A_PROJECT_URL = '/learn/how-to/Copying_a_project'
  const UPLOADING_A_PROJECT_URL = '/learn/how-to/Uploading_a_project'

  describe('enabled in Pro', () => {
    startWith({
      pro: true,
      vars: {
        OVERLEAF_PROXY_LEARN: 'true',
      },
    })
    ensureUserExists({ email: 'user@example.com' })

    it('should add a documentation entry to the nav bar', () => {
      login('user@example.com')
      cy.visit('/project')
      cy.get('nav').findByText('Documentation')
    })

    it('should render wiki page', () => {
      login('user@example.com')
      cy.visit(UPLOADING_A_PROJECT_URL)
      // Wiki content
      cy.get('.page').findByText('Uploading a project')
      cy.get('.page').contains(/how to create an Overleaf project/)
      cy.get('img[alt="Creating a new project on Overleaf"]')
        .should('be.visible')
        .and((el: any) => {
          expect(el[0].naturalWidth, 'renders image').to.be.greaterThan(0)
        })
      // Wiki navigation
      cy.get('.contents').findByText('Copying a project')
    })

    it('should navigate back and forth', function () {
      login('user@example.com')
      cy.visit(COPYING_A_PROJECT_URL)
      cy.get('.page').findByText('Copying a project')
      cy.get('.contents').findByText('Uploading a project').click()
      cy.url().should('contain', UPLOADING_A_PROJECT_URL)
      cy.get('.page').findByText('Uploading a project')
      cy.get('.contents').findByText('Copying a project').click()
      cy.url().should('contain', COPYING_A_PROJECT_URL)
      cy.get('.page').findByText('Copying a project')
    })
  })

  describe('disabled in Pro', () => {
    startWith({ pro: true })
    checkDisabled()
  })

  describe('unavailable in CE', () => {
    startWith({
      pro: false,
      vars: {
        OVERLEAF_PROXY_LEARN: 'true',
      },
    })
    checkDisabled()
  })

  function checkDisabled() {
    ensureUserExists({ email: 'user@example.com' })

    it('should not add a documentation entry to the nav bar', () => {
      login('user@example.com')
      cy.visit('/project')
      cy.findByText('Documentation').should('not.exist')
    })

    it('should not render wiki page', () => {
      login('user@example.com')
      cy.visit(COPYING_A_PROJECT_URL, {
        failOnStatusCode: false,
      })
      cy.findByText('Not found')
    })
  }
})
